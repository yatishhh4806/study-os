import { api } from "../../../../../lib/api";

export async function playPlaylist(deviceId, playlistUri) {
  return api.put("/spotify/player/play", {
    device_id: deviceId,
    context_uri: playlistUri,
  });
}

export async function pausePlayback() {
  return api.put("/spotify/player/pause");
}

export async function nextTrack() {
  return api.post("/spotify/player/next");
}

export async function previousTrack() {
  return api.post("/spotify/player/previous");
}