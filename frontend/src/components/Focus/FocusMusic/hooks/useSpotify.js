import { useCallback, useEffect, useState } from "react";
import { api, setAccessToken } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

const STORAGE_KEYS = {
  playlistId: "studyos:spotify:selectedPlaylistId",
  playlistName: "studyos:spotify:selectedPlaylistName",
};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    if (value == null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {}
}

export default function useSpotify() {
  const { refreshUser } = useAuth();

  const [spotify, setSpotify] = useState({
    connected: false,
  });

  const [spotifyLoading, setSpotifyLoading] = useState(true);

  const [connecting, setConnecting] = useState(false);

  const [disconnecting, setDisconnecting] = useState(false);

  const [playlistLoading, setPlaylistLoading] = useState(false);

  const [playlists, setPlaylists] = useState([]);

  const [selectingId, setSelectingId] = useState(null);

  const [selectedPlaylist, setSelectedPlaylist] = useState(() => {
    const id = safeGet(STORAGE_KEYS.playlistId);
    const name = safeGet(STORAGE_KEYS.playlistName);

    return id ? { id, name } : null;
  });

  const loadSpotify = useCallback(async () => {
    setSpotifyLoading(true);

    try {
      const [{ data: me }, { data: playlists }] = await Promise.all([
        api.get("/spotify/me"),
        api.get("/spotify/playlists"),
      ]);

      setSpotify(me.spotify);

      setPlaylists(playlists.playlists || []);

      if (me.spotify?.selectedPlaylistId) {
        setSelectedPlaylist({
          id: me.spotify.selectedPlaylistId,
          name: me.spotify.selectedPlaylistName,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSpotifyLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpotify();
  }, [loadSpotify]);

  const connectSpotify = async () => {
    setConnecting(true);

    try {
      const session = await api.post("/auth/refresh");

      setAccessToken(session.data.accessToken);

      const { data } = await api.get("/spotify/login");

      window.location.assign(data.authorizationUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectSpotify = async () => {
    setDisconnecting(true);

    try {
      await api.delete("/spotify/disconnect");

      setSpotify({
        connected: false,
      });

      setPlaylists([]);

      setSelectedPlaylist(null);

      safeSet(STORAGE_KEYS.playlistId, null);
      safeSet(STORAGE_KEYS.playlistName, null);

      await refreshUser?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const selectPlaylist = async (playlistId) => {
    setSelectingId(playlistId);

    try {
      const { data } = await api.get(
        `/spotify/playlists/${playlistId}`
      );

      const playlist = data.playlist;

      setSelectedPlaylist({
        id: playlist.id,
        name: playlist.name,
      });

      safeSet(STORAGE_KEYS.playlistId, playlist.id);
      safeSet(STORAGE_KEYS.playlistName, playlist.name);

      await refreshUser?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSelectingId(null);
    }
  };

  return {
    spotify,

    spotifyLoading,

    connecting,

    disconnecting,

    playlistLoading,

    playlists,

    selectingId,

    selectedPlaylist,

    loadSpotify,

    connectSpotify,

    disconnectSpotify,

    selectPlaylist,
  };
}