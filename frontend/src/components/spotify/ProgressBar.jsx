import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Slider from "./Slider";

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

  useEffect(() => {
    setValue(position);
  }, [position]);

  async function seek(positionMs) {
    try {
      await api.put("/spotify/player/seek", {
        position_ms: Math.floor(positionMs),
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-5">
      <Slider
        value={value}
        max={duration || 1}
        onValueChange={setValue}
        onValueCommit={seek}
      />

      <div className="mt-2 flex items-center justify-between text-xs text-white/50">
        <span>{format(value)}</span>

        <span>{format(duration)}</span>
      </div>
    </div>
  );
}