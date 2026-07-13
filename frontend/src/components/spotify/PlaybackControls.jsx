import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { api } from "../../lib/api";

export default function PlaybackControls({
  paused,
  deviceId,
  playlistId,
}) {
  async function play() {
  console.time("play");

  try {
    await api.put("/spotify/player/play", {
      device_id: deviceId,
      context_uri: `spotify:playlist:${playlistId}`,
    });
  } finally {
    console.timeEnd("play");
  }
}

  async function pause() {
  console.time("pause");

  try {
    await api.put("/spotify/player/pause");
  } finally {
    console.timeEnd("pause");
  }
}

  async function next() {
    try {
      await api.post("/spotify/player/next");
    } catch (err) {
      console.error(err);
    }
  }

  async function previous() {
    try {
      await api.post("/spotify/player/previous");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-6">
      <button
        onClick={previous}
        className="text-white/70 transition hover:scale-110 hover:text-white"
      >
        <SkipBack size={24} />
      </button>

      <button
        onClick={paused ? play : pause}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6] transition hover:scale-105"
      >
        {paused ? <Play fill="white" /> : <Pause />}
      </button>

      <button
        onClick={next}
        className="text-white/70 transition hover:scale-110 hover:text-white"
      >
        <SkipForward size={24} />
      </button>
    </div>
  );
}