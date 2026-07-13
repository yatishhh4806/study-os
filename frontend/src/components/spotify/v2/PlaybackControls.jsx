import { useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";

import { api } from "../../../lib/api";

export default function PlaybackControls({ paused }) {
  const [loading, setLoading] = useState(false);

  async function request(callback) {
    if (loading) return;

    setLoading(true);

    try {
      await callback();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 150);
    }
  }

  return (
    <div className="flex items-center justify-center gap-5">

      {/* Previous */}

      <button
        disabled={loading}
        onClick={() =>
          request(() =>
            api.post("/spotify/player/previous")
          )
        }
        className="spotify-button flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SkipBack size={22} />
      </button>

      {/* Play */}

      <button
        disabled={loading}
        onClick={() =>
          request(() =>
            paused
              ? api.put("/spotify/player/play")
              : api.put("/spotify/player/pause")
          )
        }
        className={`spotify-button flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_0_40px_rgba(139,92,246,.45)] transition-all duration-300 ${
          loading
            ? "scale-95"
            : "hover:scale-110 hover:shadow-[0_0_60px_rgba(139,92,246,.65)]"
        }`}
      >
        {paused ? (
          <Play
            size={28}
            fill="currentColor"
            className="ml-1"
          />
        ) : (
          <Pause size={28} />
        )}
      </button>

      {/* Next */}

      <button
        disabled={loading}
        onClick={() =>
          request(() =>
            api.post("/spotify/player/next")
          )
        }
        className="spotify-button flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SkipForward size={22} />
      </button>

    </div>
  );
}