import { useEffect, useState } from "react";
import { api } from "../../lib/api";

function format(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;

  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function ProgressBar({ position, duration }) {
  const [localPosition, setLocalPosition] = useState(position);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) {
      setLocalPosition(position);
    }
  }, [position, dragging]);

  async function handleSeek() {
    setDragging(false);

    try {
      await api.put("/spotify/player/seek", {
        position_ms: localPosition,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-5">
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={localPosition}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
        onChange={(e) => setLocalPosition(Number(e.target.value))}
        onMouseUp={handleSeek}
        onTouchEnd={handleSeek}
        className="w-full cursor-pointer accent-[#8b5cf6]"
      />

      <div className="mt-2 flex justify-between text-xs text-white/50">
        <span>{format(localPosition)}</span>
        <span>{format(duration)}</span>
      </div>
    </div>
  );
}