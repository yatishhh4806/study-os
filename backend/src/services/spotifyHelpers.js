import { AppError } from "../middleware/errorHandler.js";

export const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
export const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const SCOPES = [
  "user-read-email",
  "user-read-private",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
  "playlist-read-collaborative",
];

export function spotifyConfig() {
  const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI,
  } = process.env;

  if (
    !SPOTIFY_CLIENT_ID ||
    !SPOTIFY_CLIENT_SECRET ||
    !SPOTIFY_REDIRECT_URI
  ) {
    throw new AppError(
      "Spotify is not configured.",
      500,
      "SPOTIFY_NOT_CONFIGURED"
    );
  }

  return {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: SPOTIFY_REDIRECT_URI,
  };
}

export function basicAuthHeader(clientId, clientSecret) {
  return (
    "Basic " +
    Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  );
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
    owner:
      playlist.owner?.display_name ||
      playlist.owner?.id ||
      "Spotify",
    trackCount: playlist.tracks?.total || 0,
    uri: playlist.uri,
  };
}

export async function parseSpotifyResponse(
  response,
  fallbackMessage = "Spotify request failed"
) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AppError(
      body?.error?.message ||
        body?.error_description ||
        fallbackMessage,
      response.status,
      "SPOTIFY_API_ERROR"
    );
  }

  return body;
}