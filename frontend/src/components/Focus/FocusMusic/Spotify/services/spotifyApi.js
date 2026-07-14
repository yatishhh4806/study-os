import { api } from "../../../../../lib/api";

export async function getSpotifyProfile() {
  const { data } = await api.get("/spotify/me");
  return data;
}

export async function getPlaylists() {
  const { data } = await api.get("/spotify/playlists");
  return data.playlists;
}

export async function getPlaylist(id) {
  const { data } = await api.get(`/spotify/playlists/${id}`);
  return data.playlist;
}

export async function connectSpotify() {
  const { data } = await api.get("/spotify/login");
  window.location.href = data.authorizationUrl;
}

export async function disconnectSpotify() {
  await api.delete("/spotify/disconnect");
}