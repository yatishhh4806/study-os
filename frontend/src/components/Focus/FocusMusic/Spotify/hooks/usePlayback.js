import { useCallback, useState } from "react";

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
      if (!deviceId) {
        console.log("No device id");
        return;
      }

      console.log("====================");
      console.log("PLAY CALLED");
      console.log("deviceId:", deviceId);
      console.log("playlist:", playlist);
      console.log("playlist.uri:", playlist.uri);
      console.log("====================");

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

  return {
    play,
    pause,
    next,
    previous,
    loading,
  };
}
