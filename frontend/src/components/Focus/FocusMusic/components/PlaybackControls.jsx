import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

export default function PlaybackControls({
  paused,
  disabled = false,
  onPlayPause,
  onNext,
  onPrevious,
}) {
  return (
    <div className="flex items-center justify-center gap-5">

      {/* Previous */}

      <button
        type="button"
        disabled={disabled}
        onClick={onPrevious}
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-300 hover:border-violet-400/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SkipBack
          size={20}
          className="text-white/70 transition group-hover:text-white"
        />
      </button>

      {/* Play / Pause */}

      <button
        type="button"
        disabled={disabled}
        onClick={onPlayPause}
        className="group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 shadow-[0_0_40px_rgba(139,92,246,.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(139,92,246,.65)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {paused ? (
          <Play
            size={28}
            fill="currentColor"
            className="ml-1 text-white"
          />
        ) : (
          <Pause
            size={28}
            className="text-white"
          />
        )}
      </button>

      {/* Next */}

      <button
        type="button"
        disabled={disabled}
        onClick={onNext}
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-300 hover:border-violet-400/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SkipForward
          size={20}
          className="text-white/70 transition group-hover:text-white"
        />
      </button>

    </div>
  );
}