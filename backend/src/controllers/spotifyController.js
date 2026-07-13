import { z } from "zod";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  getPrimaryClientUrl,
  getSpotifyProfile,
  mapPlaylist,
  mapSpotifyConnection,
  spotifyRequest,
  verifySpotifyState,
} from "../services/spotifyService.js";

const playlistParamsSchema = z.object({
  id: z.string().trim().min(1),
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

function spotifyRedirect(path, status, message) {
  const params = new URLSearchParams({ spotify: status });
  if (message) params.set("message", message);
  return `${getPrimaryClientUrl()}${path}?${params.toString()}`;
}

async function findUserWithSpotifyTokens(userId) {
  const user = await User.findById(userId).select(
    "+spotify.accessToken +spotify.refreshToken",
  );

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
}

export async function login(req, res, next) {
  try {
    res.json({
      authorizationUrl: buildAuthorizationUrl(req.user._id.toString()),
    });
  } catch (err) {
    next(err);
  }
}

export async function callback(req, res) {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        spotifyRedirect(
          "/dashboard/focus",
          "error",
          "Spotify authorization was cancelled",
        ),
      );
    }

    if (!code || !state) {
      return res.redirect(
        spotifyRedirect(
          "/dashboard/focus",
          "error",
          "Spotify authorization was incomplete",
        ),
      );
    }

    const payload = verifySpotifyState(state);
    const user = await findUserWithSpotifyTokens(payload.sub);
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
    return res.redirect(spotifyRedirect("/dashboard/focus", "connected"));
  } catch (err) {
    console.error("Spotify OAuth callback failed:", err);
    return res.redirect(
      spotifyRedirect("/dashboard/focus", "error", "Spotify connection failed"),
    );
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    if (user.spotify?.connected) {
      const profile = await spotifyRequest(user, "/me");
      user.spotify.spotifyUserId = profile.id;
      user.spotify.displayName = profile.display_name || profile.id;
      user.spotify.email = profile.email || null;
      user.spotify.avatar = profile.images?.[0]?.url || null;
      await user.save();
    }

    res.json({ spotify: mapSpotifyConnection(user.spotify) });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylists(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    // Fetch user's playlists
    const data = await spotifyRequest(user, "/me/playlists?limit=30&offset=0");

    // Fetch full details for each playlist in parallel
    const playlists = await Promise.all(
      (data.items || []).map(async (playlist) => {
        try {
          const fullPlaylist = await spotifyRequest(
            user,
            `/playlists/${playlist.id}`,
          );

          console.log(fullPlaylist.name, fullPlaylist.tracks?.total);

          return mapPlaylist(fullPlaylist);
        } catch (err) {
          console.error(err);
          return mapPlaylist(playlist);
        }
      }),
    );

    res.json({
      playlists,
      selectedPlaylistId: user.spotify?.selectedPlaylistId || null,
      selectedPlaylistName: user.spotify?.selectedPlaylistName || null,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAccessToken(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    // This automatically refreshes the token if expired
    await spotifyRequest(user, "/me");

    res.json({
      accessToken: user.spotify.accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylist(req, res, next) {
  try {
    const parsed = playlistParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new AppError("Playlist id is required", 422, "VALIDATION_ERROR");
    }

    const user = await findUserWithSpotifyTokens(req.user._id);
    const playlist = await spotifyRequest(
      user,
      `/playlists/${encodeURIComponent(parsed.data.id)}`,
    );
    const mappedPlaylist = mapPlaylist(playlist);

    user.spotify.selectedPlaylistId = mappedPlaylist.id;
    user.spotify.selectedPlaylistName = mappedPlaylist.name;
    await user.save();

    res.json({
      playlist: mappedPlaylist,
      spotify: mapSpotifyConnection(user.spotify),
    });
  } catch (err) {
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        422,
        "VALIDATION_ERROR",
      );
    }

    const user = await findUserWithSpotifyTokens(req.user._id);
    const params = new URLSearchParams({
      q: parsed.data.q,
      type: "playlist",
      limit: String(parsed.data.limit),
    });
    const data = await spotifyRequest(user, `/search?${params.toString()}`);

    res.json({
      playlists: (data.playlists?.items || []).filter(Boolean).map(mapPlaylist),
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
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getPlayer(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    const playback = await spotifyRequest(user, "/me/player");

    res.json(playback);
  } catch (err) {
    next(err);
  }
}

export async function play(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    const { device_id, context_uri, uris, offset } = req.body;

    let endpoint = "/me/player/play";

    if (device_id) {
      endpoint += `?device_id=${device_id}`;
    }

    await spotifyRequest(user, endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri,
        uris,
        offset,
      }),
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function pause(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    await spotifyRequest(user, "/me/player/pause", {
      method: "PUT",
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function nextTrack(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    await spotifyRequest(user, "/me/player/next", {
      method: "POST",
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function previousTrack(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    await spotifyRequest(user, "/me/player/previous", {
      method: "POST",
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function transferPlayback(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    const { device_id } = req.body;

    if (!device_id) {
      throw new AppError("device_id is required", 400, "VALIDATION_ERROR");
    }

    await spotifyRequest(user, "/me/player", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [device_id],
        play: false,
      }),
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function seekTrack(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    const { position_ms } = req.body;

    await spotifyRequest(user, `/me/player/seek?position_ms=${position_ms}`, {
      method: "PUT",
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function setVolume(req, res, next) {
  try {
    const user = await findUserWithSpotifyTokens(req.user._id);

    const { volume_percent } = req.body;

    await spotifyRequest(
      user,
      `/me/player/volume?volume_percent=${volume_percent}`,
      {
        method: "PUT",
      },
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}
