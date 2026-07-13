import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";

import useSpotifyPlayer from "../../hooks/useSpotifyPlayer";

import PlaybackControls from "./PlaybackControls";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";

export default function SpotifyWebPlayer({ playlistId }) {
  const {
    ready,
    deviceId,
    currentTrack,
    paused,
    position,
    duration,
  } = useSpotifyPlayer();

  const startedPlaylistRef = useRef(null);

  useEffect(() => {
    if (!ready || !deviceId || !playlistId) return;

    // Prevent restarting same playlist repeatedly
    if (startedPlaylistRef.current === playlistId) return;

    startedPlaylistRef.current = playlistId;

    async function startPlayback() {
      try {
        // Transfer playback to StudyOS player
        await api.put("/spotify/player/transfer", {
          device_id: deviceId,
        });

        // Start playlist
        await api.put("/spotify/player/play", {
          device_id: deviceId,
          context_uri: `spotify:playlist:${playlistId}`,
        });
      } catch (err) {
        console.error(err);
      }
    }

    startPlayback();
  }, [ready, deviceId, playlistId]);

  if (!ready) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-[#111]">
        <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
      {currentTrack ? (
        <>
          <img
            src={currentTrack.album.images?.[0]?.url}
            alt={currentTrack.album.name}
            className="mb-5 aspect-square w-full rounded-xl object-cover"
          />

          <h3 className="truncate text-xl font-semibold text-white">
            {currentTrack.name}
          </h3>

          <p className="truncate text-sm text-white/60">
            {currentTrack.artists.map((a) => a.name).join(", ")}
          </p>

          <ProgressBar
            position={position}
            duration={duration}
          />

          <PlaybackControls
            paused={paused}
            deviceId={deviceId}
            playlistId={playlistId}
          />

          <VolumeControl />
        </>
      ) : (
        <div className="flex h-56 items-center justify-center text-white/50">
          Waiting for playback...
        </div>
      )}
    </div>
  );
}