import { Music2 } from "lucide-react";

import PlaybackControls from "../PlaybackControls";
import ProgressBar from "../ProgressBar";
import VolumeControl from "../VolumeControl";

export default function NowPlaying({
  track,
  paused,
  position,
  duration,
  volume,

  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
}) {
  if (!track) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8">

        <div className="flex flex-col items-center justify-center gap-4">

          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/[0.04]">

            <Music2
              size={34}
              className="text-white/30"
            />

          </div>

          <div className="text-center">

            <h3 className="text-lg font-semibold text-white">
              Nothing Playing
            </h3>

            <p className="mt-2 text-sm text-white/45">
              Select a playlist to begin your focus session.
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

      <div className="flex gap-6">

        {/* Artwork */}

        <div className="shrink-0">

          <img
            src={track.album.images?.[0]?.url}
            alt={track.name}
            className="h-40 w-40 rounded-3xl border border-white/10 object-cover shadow-2xl shadow-black/40 transition duration-500 hover:scale-[1.03]"
          />

        </div>

        {/* Details */}

        <div className="flex min-w-0 flex-1 flex-col">

          <span className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-violet-300">
            Now Playing
          </span>

          <h2 className="truncate text-3xl font-bold text-white">
            {track.name}
          </h2>

          <p className="mt-2 truncate text-lg text-white/65">
            {track.artists.map((artist) => artist.name).join(", ")}
          </p>

          <p className="mt-1 truncate text-sm text-white/35">
            {track.album.name}
          </p>

          {/* Equalizer */}

          <div className="mt-5 flex h-5 items-end gap-[3px]">

            {[0, 1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={`w-[3px] rounded-full bg-violet-400 ${
                  paused
                    ? "h-2 opacity-40"
                    : "focus-music-bar"
                }`}
                style={{
                  animationDelay: `${bar * 0.15}s`,
                }}
              />
            ))}

          </div>

          <div className="mt-7">

            <ProgressBar
              position={position}
              duration={duration}
              onSeek={onSeek}
            />

          </div>

          <div className="mt-7">

            <PlaybackControls
              paused={paused}
              onPlayPause={onPlayPause}
              onNext={onNext}
              onPrevious={onPrevious}
            />

          </div>

          <div className="mt-7">

            <VolumeControl
              volume={volume}
              onChange={onVolumeChange}
            />

          </div>

        </div>

      </div>

    </div>
  );
}