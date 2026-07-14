import { useEffect, useRef } from "react";
import { Loader2, Music2 } from "lucide-react";
import { api } from "../../lib/api";

import useSpotifyPlayer from "../Focus/FocusMusic/hooks/useSpotifyPlayer";

import PlaybackControls from "../Focus/FocusMusic/components/PlaybackControls";
import ProgressBar from "../Focus/FocusMusic/components/ProgressBar";
import VolumeControl from "../Focus/FocusMusic/components/VolumeControl";

export default function SpotifyWebPlayer({ playlistId }) {
  const {
    ready,
    deviceId,
    currentTrack,
    paused,
    position,
    duration,
  } = useSpotifyPlayer();

  const startedPlaylist = useRef(null);

  useEffect(() => {
    if (!ready || !deviceId || !playlistId) return;

    if (startedPlaylist.current === playlistId) return;

    startedPlaylist.current = playlistId;

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

  if (!ready) {
    return (
      <div className="flex h-[620px] items-center justify-center rounded-[32px] border border-white/10 bg-[#13131a]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#1A1625] via-[#13111B] to-[#0B0A10] p-8 shadow-[0_20px_70px_rgba(139,92,246,0.18)] backdrop-blur-xl">

      {/* Ambient Glow */}
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[110px]" />

      {currentTrack ? (
        <>
          {/* Album Art */}
          <div className="relative z-10 flex justify-center">

            <div className="absolute h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <img
              src={currentTrack.album.images?.[0]?.url}
              alt={currentTrack.album.name}
              className={`relative h-64 w-64 rounded-[28px] object-cover shadow-2xl transition-all duration-700 ${
                paused
                  ? "scale-100"
                  : "scale-[1.03] shadow-violet-500/40"
              }`}
            />

          </div>

          {/* Song */}
          <div className="relative z-10 mt-8 text-center">

            <h2 className="truncate text-3xl font-bold tracking-tight text-white">

              {currentTrack.name}

            </h2>

            <p className="mt-2 truncate text-base text-white/60">

              {currentTrack.artists.map((a) => a.name).join(", ")}

            </p>

          </div>

          {/* Progress */}
          <div className="relative z-10 mt-8">

            <ProgressBar
              position={position}
              duration={duration}
            />

          </div>

          {/* Controls */}
          <div className="relative z-10 mt-7">

            <PlaybackControls
              paused={paused}
            />

          </div>

          {/* Volume */}
          <div className="relative z-10 mt-8">

            <VolumeControl />

          </div>

          {/* Divider */}
          <div className="relative z-10 mt-8 border-t border-white/10" />

          {/* Footer */}
          <div className="relative z-10 mt-5 flex items-center justify-center gap-2 text-sm text-white/50">

            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />

            Spotify Premium Connected

          </div>
        </>
      ) : (
        <div className="relative z-10 flex h-[520px] flex-col items-center justify-center text-center">

          <Music2
            className="mb-5 text-violet-400"
            size={60}
          />

          <h3 className="text-xl font-semibold text-white">

            Waiting for Playback

          </h3>

          <p className="mt-2 text-sm text-white/50">

            Start a playlist to begin listening.

          </p>

        </div>
      )}
    </div>
  );
}