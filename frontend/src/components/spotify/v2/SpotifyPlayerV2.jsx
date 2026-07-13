import { useEffect, useRef } from "react";
import { Loader2, Music2 } from "lucide-react";

import { api } from "../../../lib/api";
import useSpotifyPlayer from "../../../hooks/useSpotifyPlayer";

import AlbumArt from "./AlbumArt";
import TrackInfo from "./TrackInfo";
import ProgressBar from "./ProgressBar";
import PlaybackControls from "./PlaybackControls";
import VolumeControl from "./VolumeControl";
import DeviceStatus from "./DeviceStatus";

import "./spotify-v2.css";

export default function SpotifyPlayerV2({ playlistId }) {
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
      <div className="flex h-[420px] items-center justify-center rounded-[30px] border border-white/10 bg-[#15131D]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center rounded-[30px] border border-white/10 bg-[#15131D] text-center">
        <Music2
          size={64}
          className="mb-5 text-violet-400"
        />

        <h2 className="text-2xl font-bold text-white">
          Focus Music
        </h2>

        <p className="mt-2 text-white/60">
          Start a playlist to begin listening.
        </p>
      </div>
    );
  }

  return (
    <div className="spotify-card relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#1B1625] via-[#15131D] to-[#0B0A10] p-8 shadow-[0_25px_70px_rgba(0,0,0,.45)]">

      {/* Ambient Glow */}
      <div className="spotify-glow absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[120px]" />

      {/* Header */}
      <div className="relative z-10 mb-8">

        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-300">
          Focus Music
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Your soundtrack for deep work
        </h2>

      </div>

      {/* Desktop Layout */}
      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[190px_1fr]">

        {/* Album */}
        <AlbumArt
          track={currentTrack}
          paused={paused}
        />

        {/* Right Side */}
        <div className="flex flex-col justify-between">

          <TrackInfo
            track={currentTrack}
            paused={paused}
          />

          <div className="mt-8">

            <ProgressBar
              position={position}
              duration={duration}
            />

          </div>

          <div className="mt-8">

            <PlaybackControls
              paused={paused}
            />

          </div>

          <div className="mt-8">

            <VolumeControl />

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="relative z-10 mt-10 border-t border-white/10 pt-6">

        <DeviceStatus />

      </div>

    </div>
  );
}