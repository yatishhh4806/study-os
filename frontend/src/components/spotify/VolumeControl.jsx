import { useState } from "react";
import { Volume2 } from "lucide-react";
import { api } from "../../lib/api";

export default function VolumeControl() {
  const [volume, setVolume] = useState(60);

  async function sendVolume() {
    try {
      await api.put("/spotify/player/volume", {
        volume_percent: volume,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-5 flex items-center gap-3">
      <Volume2 size={18} className="text-white/70" />

      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        onMouseUp={sendVolume}
        onTouchEnd={sendVolume}
        className="w-full cursor-pointer accent-[#8b5cf6]"
      />
    </div>
  );
}