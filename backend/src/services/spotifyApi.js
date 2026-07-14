import { SPOTIFY_API_URL, parseSpotifyResponse } from "./spotifyHelpers.js";
import { ensureSpotifyAccessToken } from "./spotifyAuth.js";

export async function spotifyRequest(
  user,
  path,
  options = {}
) {
  const accessToken =
    await ensureSpotifyAccessToken(user);

  const response = await fetch(
    `${SPOTIFY_API_URL}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    }
  );

  if (response.status === 204) {
    return null;
  }

  return parseSpotifyResponse(response);
}

export async function getSpotifyProfile(
  accessToken
) {
  const response = await fetch(
    `${SPOTIFY_API_URL}/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return parseSpotifyResponse(
    response,
    "Failed to fetch Spotify profile"
  );
}

export async function getCurrentUser(user) {
  return spotifyRequest(user, "/me");
}

export async function getUserPlaylists(user) {
  const data = await spotifyRequest(
    user,
    "/me/playlists?limit=50"
  );

  return data.items || [];
}

export async function getPlaylist(
  user,
  playlistId
) {
  return spotifyRequest(
    user,
    `/playlists/${playlistId}`
  );
}

export async function searchPlaylists(
  user,
  query,
  limit = 10
) {
  const params = new URLSearchParams({
    q: query,
    type: "playlist",
    limit: String(limit),
  });

  return spotifyRequest(
    user,
    `/search?${params.toString()}`
  );
}

export async function getPlayback(user) {
  return spotifyRequest(
    user,
    "/me/player"
  );
}

export async function getDevices(user) {
  return spotifyRequest(
    user,
    "/me/player/devices"
  );
}

export async function transferPlayback(
  user,
  deviceId
) {
  return spotifyRequest(
    user,
    "/me/player",
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    }
  );
}

export async function play(
  user,
  body,
  deviceId
) {
  let endpoint = "/me/player/play";

  if (deviceId) {
    endpoint += `?device_id=${deviceId}`;
  }

  return spotifyRequest(
    user,
    endpoint,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

export async function pause(user) {
  return spotifyRequest(
    user,
    "/me/player/pause",
    {
      method: "PUT",
    }
  );
}

export async function nextTrack(user) {
  return spotifyRequest(
    user,
    "/me/player/next",
    {
      method: "POST",
    }
  );
}

export async function previousTrack(user) {
  return spotifyRequest(
    user,
    "/me/player/previous",
    {
      method: "POST",
    }
  );
}

export async function seek(
  user,
  position
) {
  return spotifyRequest(
    user,
    `/me/player/seek?position_ms=${position}`,
    {
      method: "PUT",
    }
  );
}

export async function setVolume(
  user,
  volume
) {
  return spotifyRequest(
    user,
    `/me/player/volume?volume_percent=${volume}`,
    {
      method: "PUT",
    }
  );
}