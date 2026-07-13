import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler.js";
import { env } from "../config/env.js";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
];

function getSpotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new AppError(
      "Spotify is not configured on the server",
      503,
      "SPOTIFY_NOT_CONFIGURED",
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function getPrimaryClientUrl() {
  return Array.isArray(env.CLIENT_URL) ? env.CLIENT_URL[0] : env.CLIENT_URL;
}

function spotifyTokenHeaders(clientId, clientSecret) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
  };
}

async function parseSpotifyResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message || body?.error_description || fallbackMessage;
    throw new AppError(message, response.status, "SPOTIFY_API_ERROR");
  }

  return body;
}

export function createSpotifyState(userId) {
  return jwt.sign(
    {
      sub: userId,
      nonce: crypto.randomBytes(16).toString("hex"),
      type: "spotify_oauth",
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "10m" },
  );
}

export function verifySpotifyState(state) {
  try {
    const payload = jwt.verify(state, env.JWT_ACCESS_SECRET);

    if (payload.type !== "spotify_oauth" || !payload.sub) {
      throw new Error("Invalid Spotify state payload");
    }

    return payload;
  } catch {
    throw new AppError("Spotify authorization state is invalid or expired", 400, "INVALID_SPOTIFY_STATE");
  }
}

export function buildAuthorizationUrl(userId) {
  const { clientId, redirectUri } = getSpotifyConfig();
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
  const { clientId, clientSecret, redirectUri } = getSpotifyConfig();
  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: spotifyTokenHeaders(clientId, clientSecret),
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  return parseSpotifyResponse(response, "Could not connect Spotify");
}

export async function refreshSpotifyAccessToken(refreshToken) {
  const { clientId, clientSecret } = getSpotifyConfig();
  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: spotifyTokenHeaders(clientId, clientSecret),
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  return parseSpotifyResponse(response, "Could not refresh Spotify access");
}

export async function spotifyRequest(user, path, options = {}) {
  if (!user.spotify?.connected || !user.spotify?.refreshToken) {
    throw new AppError("Spotify is not connected", 409, "SPOTIFY_NOT_CONNECTED");
  }

  let accessToken = user.spotify.accessToken;
  const expiresAt = user.spotify.expiresAt ? new Date(user.spotify.expiresAt).getTime() : 0;

  if (!accessToken || expiresAt - TOKEN_REFRESH_BUFFER_MS <= Date.now()) {
    const refreshed = await refreshSpotifyAccessToken(user.spotify.refreshToken);
    accessToken = refreshed.access_token;
    user.spotify.accessToken = accessToken;
    user.spotify.expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

    if (refreshed.refresh_token) {
      user.spotify.refreshToken = refreshed.refresh_token;
    }

    await user.save();
  }

  const response = await fetch(`${SPOTIFY_API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseSpotifyResponse(response, "Spotify request failed");
}

export async function getSpotifyProfile(accessToken) {
  const response = await fetch(`${SPOTIFY_API_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return parseSpotifyResponse(response, "Could not fetch Spotify profile");
}

export function mapSpotifyConnection(spotify = {}) {
  return {
    connected: !!spotify.connected,
    spotifyUserId: spotify.spotifyUserId || null,
    displayName: spotify.displayName || null,
    email: spotify.email || null,
    avatar: spotify.avatar || null,
    selectedPlaylistId: spotify.selectedPlaylistId || null,
    selectedPlaylistName: spotify.selectedPlaylistName || null,
  };
}

export function mapPlaylist(playlist) {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || "",
    image: playlist.images?.[0]?.url || null,
    trackCount: playlist.tracks?.total || 0,
    owner: playlist.owner?.display_name || playlist.owner?.id || "Spotify",
    public: playlist.public,
    collaborative: playlist.collaborative,
    uri: playlist.uri,
    externalUrl: playlist.external_urls?.spotify || null,
  };
}
