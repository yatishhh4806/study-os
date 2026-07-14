import crypto from "crypto";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

import {
  SPOTIFY_ACCOUNTS_URL,
  SCOPES,
  spotifyConfig,
  basicAuthHeader,
  parseSpotifyResponse,
} from "./spotifyHelpers.js";

const TOKEN_REFRESH_BUFFER = 60 * 1000;

export function createSpotifyState(userId) {
  return jwt.sign(
    {
      sub: userId,
      nonce: crypto.randomBytes(16).toString("hex"),
      type: "spotify",
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "10m",
    }
  );
}

export function verifySpotifyState(state) {
  try {
    const payload = jwt.verify(
      state,
      process.env.JWT_ACCESS_SECRET
    );

    if (
      payload.type !== "spotify" ||
      !payload.sub
    ) {
      throw new Error();
    }

    return payload;
  } catch {
    throw new AppError(
      "Invalid Spotify state",
      400,
      "INVALID_SPOTIFY_STATE"
    );
  }
}

export function buildSpotifyAuthorizationUrl(userId) {
  const {
    clientId,
    redirectUri,
  } = spotifyConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    state: createSpotifyState(userId),
    show_dialog: "true",
  });

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code) {
  const {
    clientId,
    clientSecret,
    redirectUri,
  } = spotifyConfig();

  const response = await fetch(
    `${SPOTIFY_ACCOUNTS_URL}/api/token`,
    {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(
          clientId,
          clientSecret
        ),
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    }
  );

  return parseSpotifyResponse(
    response,
    "Failed to exchange Spotify code"
  );
}

export async function refreshSpotifyAccessToken(
  refreshToken
) {
  const {
    clientId,
    clientSecret,
  } = spotifyConfig();

  const response = await fetch(
    `${SPOTIFY_ACCOUNTS_URL}/api/token`,
    {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(
          clientId,
          clientSecret
        ),
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    }
  );

  return parseSpotifyResponse(
    response,
    "Failed to refresh Spotify token"
  );
}

export async function ensureSpotifyAccessToken(
  user
) {
  if (
    !user.spotify?.connected ||
    !user.spotify?.refreshToken
  ) {
    throw new AppError(
      "Spotify not connected",
      409,
      "SPOTIFY_NOT_CONNECTED"
    );
  }

  const expiresAt = user.spotify.expiresAt
    ? new Date(
        user.spotify.expiresAt
      ).getTime()
    : 0;

  if (
    user.spotify.accessToken &&
    expiresAt >
      Date.now() + TOKEN_REFRESH_BUFFER
  ) {
    return user.spotify.accessToken;
  }

  const refreshed =
    await refreshSpotifyAccessToken(
      user.spotify.refreshToken
    );

  user.spotify.accessToken =
    refreshed.access_token;

  user.spotify.expiresAt = new Date(
    Date.now() +
      refreshed.expires_in * 1000
  );

  if (refreshed.refresh_token) {
    user.spotify.refreshToken =
      refreshed.refresh_token;
  }

  await user.save();

  return user.spotify.accessToken;
}

export async function findSpotifyUser(
  userId
) {
  const user = await User.findById(userId).select(
    "+spotify.accessToken +spotify.refreshToken"
  );

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  return user;
}