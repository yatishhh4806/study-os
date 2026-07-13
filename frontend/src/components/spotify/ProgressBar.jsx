import { api } from "../../lib/api";

function format(ms) {
  const totalSeconds = Math.floor(ms / 1000);

  const min = Math.floor(totalSeconds / 60);

  const sec = totalSeconds % 60;

  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function ProgressBar({
  position,
  duration,
}) {
  async function seek(e) {
    const value = Number(e.target.value);

    try {
      await api.put("/spotify/player/seek", {
        position_ms: value,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-6">
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={position}
        onChange={seek}
        className="h-1 w-full cursor-pointer accent-[#8b5cf6]"
      />

      <div className="mt-2 flex justify-between text-xs text-white/50">
        <span>{format(position)}</span>

        <span>{format(duration)}</span>
      </div>
    </div>
  );
}