import { useCallback, useState } from "react";
import { api } from "../../../../../lib/api";

import {
  playPlaylist,
  pausePlayback,
  nextTrack,
  previousTrack,
} from "../services/playerApi";

export default function usePlayback(deviceId) {
  const [loading, setLoading] = useState(false);

  const play = useCallback(
    async (playlist) => {
      if (!deviceId) return;

      try {
        setLoading(true);
        await playPlaylist(deviceId, playlist.uri);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [deviceId],
  );

  const pause = useCallback(async () => {
    try {
      await pausePlayback();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const next = useCallback(async () => {
    try {
      await nextTrack();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const previous = useCallback(async () => {
    try {
      await previousTrack();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const seek = useCallback(async (positionMs) => {
    try {
      await api.put(`/spotify/player/seek?position_ms=${Math.round(positionMs)}`);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const setVolume = useCallback(async (percent) => {
    try {
      await api.put(`/spotify/player/volume?volume_percent=${Math.round(percent)}`);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    loading,
  };
}