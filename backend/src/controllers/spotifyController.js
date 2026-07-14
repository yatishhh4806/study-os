import { z } from "zod";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

import {
  buildSpotifyAuthorizationUrl,
  verifySpotifyState,
  exchangeCodeForTokens,
  findSpotifyUser,
} from "../services/spotifyAuth.js";

import {
  getSpotifyProfile,
  getCurrentUser,
  getUserPlaylists,
  getPlaylist,
  searchPlaylists,
  getPlayback,
  getDevices,
  waitForDevice,
  play as spotifyPlay,
  pause as spotifyPause,
  nextTrack as spotifyNext,
  previousTrack as spotifyPrevious,
  transferPlayback as spotifyTransferPlayback,
  seek as spotifySeek,
  setVolume as spotifySetVolume,
} from "../services/spotifyApi.js";

import {
  mapSpotifyConnection,
  mapPlaylist,
} from "../services/spotifyHelpers.js";

const playlistSchema = z.object({
  id: z.string().trim().min(1),
});

const searchSchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

const clientUrl = () => process.env.CLIENT_URL;

function redirect(status, message = "") {
  const params = new URLSearchParams({
    spotify: status,
  });

  if (message) {
    params.set("message", message);
  }

  return `${clientUrl()}/dashboard/focus?${params.toString()}`;
}

export async function login(req, res, next) {
  try {
    res.json({
      authorizationUrl: buildSpotifyAuthorizationUrl(req.user._id.toString()),
    });
  } catch (err) {
    next(err);
  }
}

export async function callback(req, res) {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(redirect("error", "Spotify authorization cancelled"));
    }

    if (!code || !state) {
      return res.redirect(redirect("error", "Spotify authorization failed"));
    }

    const payload = verifySpotifyState(state);

    const user = await findSpotifyUser(payload.sub);

    const tokenData = await exchangeCodeForTokens(code);

    const profile = await getSpotifyProfile(tokenData.access_token);

    user.spotify = {
      connected: true,
      spotifyUserId: profile.id,
      displayName: profile.display_name || profile.id,
      email: profile.email || null,
      avatar: profile.images?.[0]?.url || null,
      accessToken: tokenData.access_token,
      refreshToken:
        tokenData.refresh_token || user.spotify?.refreshToken || null,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      selectedPlaylistId: user.spotify?.selectedPlaylistId || null,
      selectedPlaylistName: user.spotify?.selectedPlaylistName || null,
    };

    await user.save();

    res.redirect(redirect("connected"));
  } catch (err) {
    console.error(err);

    res.redirect(redirect("error", "Spotify connection failed"));
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    if (user.spotify.connected) {
      const profile = await getCurrentUser(user);

      user.spotify.spotifyUserId = profile.id;

      user.spotify.displayName = profile.display_name || profile.id;

      user.spotify.email = profile.email || null;

      user.spotify.avatar = profile.images?.[0]?.url || null;

      await user.save();
    }

    res.json({
      spotify: mapSpotifyConnection(user.spotify),
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylists(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    const playlists = await getUserPlaylists(user);

    res.json({
      playlists: playlists.map(mapPlaylist),
      selectedPlaylistId: user.spotify.selectedPlaylistId,
      selectedPlaylistName: user.spotify.selectedPlaylistName,
    });
  } catch (err) {
    next(err);
  }
}

export async function selectPlaylist(req, res, next) {
  try {
    const parsed = playlistSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new AppError("Playlist id required", 422, "VALIDATION_ERROR");
    }

    const user = await findSpotifyUser(req.user._id);

    const playlist = await getPlaylist(user, parsed.data.id);

    const mapped = mapPlaylist(playlist);

    user.spotify.selectedPlaylistId = mapped.id;

    user.spotify.selectedPlaylistName = mapped.name;

    await user.save();

    res.json({
      playlist: mapped,
      spotify: mapSpotifyConnection(user.spotify),
    });
  } catch (err) {
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const parsed = searchSchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        422,
        "VALIDATION_ERROR",
      );
    }

    const user = await findSpotifyUser(req.user._id);

    const result = await searchPlaylists(
      user,
      parsed.data.q,
      parsed.data.limit,
    );

    res.json({
      playlists: (result.playlists?.items || []).map(mapPlaylist),
    });
  } catch (err) {
    next(err);
  }
}

export async function disconnect(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    user.spotify = {
      connected: false,
      spotifyUserId: null,
      displayName: null,
      email: null,
      avatar: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      selectedPlaylistId: null,
      selectedPlaylistName: null,
    };

    await user.save();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function getAccessToken(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    // Force a refresh if needed by calling Spotify once
    await getCurrentUser(user);

    res.json({
      accessToken: user.spotify.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlayer(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    const playback = await getPlayback(user);

    res.json(playback);
  } catch (err) {
    next(err);
  }
}

export async function getAvailableDevices(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    const devices = await getDevices(user);

    res.json(devices);
  } catch (err) {
    next(err);
  }
}

export async function play(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    const { device_id, context_uri, uris, offset } = req.body;

    await spotifyPlay(
      user,
      {
        context_uri,
        uris,
        offset,
      },
      device_id,
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function pause(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    await spotifyPause(user);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function nextTrack(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    await spotifyNext(user);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function previousTrack(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    await spotifyPrevious(user);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
export async function transferPlayback(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    const { device_id } = req.body;

    if (!device_id) {
      throw new AppError("device_id required", 400, "VALIDATION_ERROR");
    }

    const deviceFound = await waitForDevice(user, device_id);

    if (!deviceFound) {
      throw new AppError(
        "Spotify device not registered yet — try again",
        409,
        "DEVICE_NOT_READY",
      );
    }

    await spotifyTransferPlayback(user, device_id);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function seekTrack(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    await spotifySeek(user, req.body.position_ms);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function setVolume(req, res, next) {
  try {
    const user = await findSpotifyUser(req.user._id);

    await spotifySetVolume(user, req.body.volume_percent);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
