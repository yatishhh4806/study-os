import { useCallback, useEffect, useState } from "react";
import {
  getSpotifyProfile,
  getPlaylists,
  getPlaylist,
  connectSpotify,
  disconnectSpotify,
} from "../services/spotifyApi";

export default function useSpotify() {
  const [loading, setLoading] = useState(true);

  const [spotify, setSpotify] = useState({
    connected: false,
  });

  const [playlists, setPlaylists] = useState([]);

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const [connecting, setConnecting] = useState(false);

  const [disconnecting, setDisconnecting] = useState(false);

  const [selectingId, setSelectingId] = useState(null);

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
    }
  }, []);

  useEffect(() => {
    loadSpotify();
  }, [loadSpotify]);

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

    spotify,

    playlists,

    selectedPlaylist,

    connecting,

    disconnecting,

    selectingId,

    loadSpotify,

    connectSpotify: handleConnect,

    disconnectSpotify: handleDisconnect,

    selectPlaylist: handleSelectPlaylist,
  };
}