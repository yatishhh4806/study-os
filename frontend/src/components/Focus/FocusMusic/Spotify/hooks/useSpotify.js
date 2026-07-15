import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpotifyProfile,
  getPlaylists,
  getPlaylist,
  connectSpotify,
  disconnectSpotify,
} from "../services/spotifyApi";

export default function useSpotify() {
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [spotify, setSpotify] = useState({
    connected: false,
  });

  const [playlists, setPlaylists] = useState([]);

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const [connecting, setConnecting] = useState(false);

  const [disconnecting, setDisconnecting] = useState(false);

  const [selectingId, setSelectingId] = useState(null);

  const initialLoadDone = useRef(false);

  const loadSpotify = useCallback(async () => {
    setLoading(true);

    try {
      const profile = await getSpotifyProfile();

      setSpotify(profile.spotify);

      if (!profile.spotify.connected) {
        setPlaylists([]);
        setSelectedPlaylist(null);
        return;
      }

      const playlistList = await getPlaylists();

      setPlaylists(playlistList);

      if (profile.spotify.selectedPlaylistId) {
        setSelectedPlaylist({
          id: profile.spotify.selectedPlaylistId,
          name: profile.spotify.selectedPlaylistName,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    loadSpotify();
  }, [loadSpotify]);

  // Lightweight refresh — keeps existing playlists visible, only spins the icon
  const refreshPlaylists = useCallback(async () => {
    setRefreshing(true);
    try {
      const playlistList = await getPlaylists();
      setPlaylists(playlistList);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  async function handleConnect() {
    try {
      setConnecting(true);
      await connectSpotify();
    } catch (err) {
      console.error(err);
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      setDisconnecting(true);

      await disconnectSpotify();

      setSpotify({ connected: false });
      setPlaylists([]);
      setSelectedPlaylist(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleSelectPlaylist(id) {
    try {
      setSelectingId(id);

      const playlist = await getPlaylist(id);

      setSelectedPlaylist({
        id: playlist.id,
        name: playlist.name,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSelectingId(null);
    }
  }

  return {
    loading,

    refreshing,

    spotify,

    playlists,

    selectedPlaylist,

    connecting,

    disconnecting,

    selectingId,

    loadSpotify,

    refreshPlaylists,

    connectSpotify: handleConnect,

    disconnectSpotify: handleDisconnect,

    selectPlaylist: handleSelectPlaylist,
  };
}