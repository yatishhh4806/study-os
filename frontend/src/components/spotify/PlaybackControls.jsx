import { useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { api } from "../../lib/api";

export default function PlaybackControls({
  paused,
  deviceId,
  playlistId,
}) {
  const [loading, setLoading] = useState(false);

  async function play() {
    if (loading) return;

    setLoading(true);

    try {
      await api.put("/spotify/player/play");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function pause() {
    if (loading) return;

    setLoading(true);

    try {
      await api.put("/spotify/player/pause");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function next() {
    if (loading) return;

    setLoading(true);

    try {
      await api.post("/spotify/player/next");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function previous() {
    if (loading) return;

    setLoading(true);

    try {
      await api.post("/spotify/player/previous");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-6">
      <button
        disabled={loading}
        onClick={previous}
        className="rounded-full p-2 text-white/70 transition-all hover:scale-110 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SkipBack size={24} />
      </button>

      <button
        disabled={loading}
        onClick={paused ? play : pause}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 text-white transition-all hover:scale-105 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paused ? (
          <Play
            size={22}
            fill="currentColor"
          />
        ) : (
          <Pause size={22} />
        )}
      </button>

      <button
        disabled={loading}
        onClick={next}
        className="rounded-full p-2 text-white/70 transition-all hover:scale-110 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SkipForward size={24} />
      </button>
    </div>
  );
}