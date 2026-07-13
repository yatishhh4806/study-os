import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import PlaybackControls from "./PlaybackControls";
import { api } from "../../lib/api";
import useSpotifyPlayer from "../../hooks/useSpotifyPlayer";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";

export default function SpotifyWebPlayer({ playlistId }) {
  const { ready, deviceId, currentTrack, paused, position, duration } =
    useSpotifyPlayer();

  useEffect(() => {
    if (!ready || !deviceId || !playlistId) return;

    async function startPlayback() {
      try {
        await api.put("/spotify/player/transfer", {
          device_id: deviceId,
        });

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

  const togglePlayback = async () => {
    try {
      if (paused) {
        await api.put("/spotify/player/play");
      } else {
        await api.put("/spotify/player/pause");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!ready) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
      {currentTrack ? (
        <>
          <img
            src={currentTrack.album.images[0]?.url}
            alt=""
            className="mb-4 aspect-square w-full rounded-xl object-cover"
          />

          <h3 className="truncate text-lg font-bold">{currentTrack.name}</h3>

          <p className="truncate text-sm text-white/60">
            {currentTrack.artists.map((a) => a.name).join(", ")}
          </p>

          <ProgressBar position={position} duration={duration} />

          <PlaybackControls
            paused={paused}
            deviceId={deviceId}
            playlistId={playlistId}
          />

          <VolumeControl />
        </>
      ) : (
        <p className="text-sm text-white/50">Waiting for playback...</p>
      )}
    </div>
  );
}
