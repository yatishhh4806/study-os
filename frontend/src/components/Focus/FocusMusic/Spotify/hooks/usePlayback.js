import { useCallback, useState } from "react";
import { api } from "../../../../../lib/api";

import {
  playPlaylist,
  pausePlayback,
  nextTrack,
  previousTrack,
} from "../services/playerApi";

export default function usePlayback(playerInstance, deviceId) {
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

  const resume = useCallback(async () => {
    if (playerInstance) {
      try {
        await playerInstance.resume();
        return;
      } catch (err) {
        console.error("Local resume failed, falling back to API:", err);
      }
    }
    try {
      await api.put("/spotify/player/play");
    } catch (err) {
      console.error(err);
    }
  }, [playerInstance]);

  const pause = useCallback(async () => {
    if (playerInstance) {
      try {
        await playerInstance.pause();
        return;
      } catch (err) {
        console.error("Local pause failed, falling back to API:", err);
      }
    }
    try {
      await pausePlayback();
    } catch (err) {
      console.error(err);
    }
  }, [playerInstance]);

  const next = useCallback(async () => {
    if (playerInstance) {
      try {
        await playerInstance.nextTrack();
        return;
      } catch (err) {
        console.error("Local nextTrack failed, falling back to API:", err);
      }
    }
    try {
      await nextTrack();
    } catch (err) {
      console.error(err);
    }
  }, [playerInstance]);

  const previous = useCallback(async () => {
    if (playerInstance) {
      try {
        await playerInstance.previousTrack();
        return;
      } catch (err) {
        console.error("Local previousTrack failed, falling back to API:", err);
      }
    }
    try {
      await previousTrack();
    } catch (err) {
      console.error(err);
    }
  }, [playerInstance]);

  const seek = useCallback(async (positionMs) => {
    if (playerInstance) {
      try {
        await playerInstance.seek(Math.round(positionMs));
        return;
      } catch (err) {
        console.error("Local seek failed, falling back to API:", err);
      }
    }
    try {
      await api.put("/spotify/player/seek", { position_ms: Math.round(positionMs) });
    } catch (err) {
      console.error(err);
    }
  }, [playerInstance]);

  const setVolume = useCallback(async (percent) => {
    if (playerInstance) {
      try {
        // Web Playback SDK volume accepts a float between 0.0 and 1.0
        await playerInstance.setVolume(percent / 100);
        return;
      } catch (err) {
        console.error("Local setVolume failed, falling back to API:", err);
      }
    }
    try {
      await api.put("/spotify/player/volume", { volume_percent: Math.round(percent) });
    } catch (err) {
      console.error(err);
    }
  }, [playerInstance]);

  return {
    play,
    resume,
    pause,
    next,
    previous,
    seek,
    setVolume,
    loading,
  };
}