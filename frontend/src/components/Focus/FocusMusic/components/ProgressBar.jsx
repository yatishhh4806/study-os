import { useEffect, useState } from "react";
import Slider from "../../../spotify/Slider";

function format(ms = 0) {
  const totalSeconds = Math.floor(ms / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ProgressBar({
  position,
  duration,
  onSeek,
}) {
  const [value, setValue] = useState(position);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) {
      setValue(position);
    }
  }, [position, dragging]);

  function handleCommit(value) {
    setDragging(false);

    if (onSeek) {
      onSeek(Math.floor(value));
    }
  }

  return (
    <div className="space-y-3">

      <Slider
        value={value}
        max={duration || 1}
        onValueChange={(value) => {
          setDragging(true);
          setValue(value);
        }}
        onValueCommit={handleCommit}
      />

      <div className="flex items-center justify-between">

        <span className="text-xs font-medium tabular-nums text-white/55">
          {format(value)}
        </span>

        <span className="text-xs font-medium tabular-nums text-white/55">
          {format(duration)}
        </span>

      </div>

    </div>
  );
}