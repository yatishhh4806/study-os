import { Heart } from "lucide-react";
import Visualizer from "./Visualizer";

export default function TrackInfo({ track, paused }) {
  const title = track?.name || "Unknown Track";

  const artists =
    track?.artists?.map((artist) => artist.name).join(", ") ||
    "Unknown Artist";

  return (
    <div className="flex flex-col">

      {/* Top Row */}
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0 flex-1">

          {/* Focus Label */}

          <div className="mb-3 flex items-center gap-3">

            <Visualizer paused={paused} />

            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
              NOW PLAYING
            </span>

          </div>

          {/* Song */}

          <div className="marquee">

            <span className="block text-4xl font-bold tracking-tight text-white">
              {title}
            </span>

          </div>

          {/* Artist */}

          <p className="mt-3 text-lg text-white/60">

            {artists}

          </p>

        </div>

        {/* Favourite Button */}

        <button
          className="spotify-button flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/10"
          title="Coming Soon"
        >
          <Heart
            size={22}
            className="text-white/60"
          />
        </button>

      </div>

      {/* Album */}

      <div className="mt-5 flex items-center gap-2">

        <div className="h-2 w-2 rounded-full bg-violet-400" />

        <span className="truncate text-sm text-white/40">

          {track?.album?.name}

        </span>

      </div>

    </div>
  );
}