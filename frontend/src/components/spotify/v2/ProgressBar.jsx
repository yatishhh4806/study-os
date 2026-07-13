import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import Slider from "../Slider";

function format(ms = 0) {
  const totalSeconds = Math.floor(ms / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ProgressBar({
  position,
  duration,
}) {
  const [value, setValue] = useState(position);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) {
      setValue(position);
    }
  }, [position, dragging]);

  async function handleSeek(value) {
    setDragging(false);

    try {
      await api.put("/spotify/player/seek", {
        position_ms: Math.floor(value),
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-4">

      <Slider
        value={value}
        max={duration || 1}
        onValueChange={(v) => {
          setDragging(true);
          setValue(v);
        }}
        onValueCommit={handleSeek}
      />

      <div className="flex items-center justify-between">

        <span className="text-sm font-medium tabular-nums text-white/60">
          {format(value)}
        </span>

        <span className="text-sm font-medium tabular-nums text-white/60">
          {format(duration)}
        </span>

      </div>

    </div>
  );
}