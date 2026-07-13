import { useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { api } from "../../lib/api";

export default function PlaybackControls({ paused }) {
  const [loading, setLoading] = useState(false);

  async function request(fn) {
    if (loading) return;

    setLoading(true);

    try {
      await fn();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }

  return (
    <div className="flex items-center justify-center gap-7">
      {/* Previous */}
      <button
        disabled={loading}
        onClick={() =>
          request(() => api.post("/spotify/player/previous"))
        }
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:scale-110 hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SkipBack
          size={22}
          className="text-white/70 transition group-hover:text-white"
        />
      </button>

      {/* Play / Pause */}
      <button
        disabled={loading}
        onClick={() =>
          request(() =>
            paused
              ? api.put("/spotify/player/play")
              : api.put("/spotify/player/pause")
          )
        }
        className={`group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.45)] transition-all duration-300 ${
          loading
            ? "scale-95"
            : "hover:scale-110 hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]"
        }`}
      >
        {paused ? (
          <Play
            size={26}
            fill="currentColor"
            className="ml-1"
          />
        ) : (
          <Pause size={26} />
        )}
      </button>

      {/* Next */}
      <button
        disabled={loading}
        onClick={() =>
          request(() => api.post("/spotify/player/next"))
        }
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:scale-110 hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SkipForward
          size={22}
          className="text-white/70 transition group-hover:text-white"
        />
      </button>
    </div>
  );
}