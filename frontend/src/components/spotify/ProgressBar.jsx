import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Slider from "./Slider";

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
      <Slider
        value={localPosition}
        max={duration || 0}
        onValueChange={setLocalPosition}
        onValueCommit={async (value) => {
          try {
            await api.put("/spotify/player/seek", {
              position_ms: value,
            });
          } catch (err) {
            console.error(err);
          }
        }}
      />

      <div className="mt-2 flex justify-between text-xs text-white/50">
        <span>{format(localPosition)}</span>
        <span>{format(duration)}</span>
      </div>
    </div>
  );
}
