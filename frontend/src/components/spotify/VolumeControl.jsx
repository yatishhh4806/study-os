import { useState } from "react";
import { Volume2 } from "lucide-react";
import { api } from "../../lib/api";

export default function VolumeControl() {
  const [volume, setVolume] = useState(60);

  async function handleVolumeChange(e) {
    const value = Number(e.target.value);

    setVolume(value);

    try {
      await api.put("/spotify/player/volume", {
        volume_percent: value,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <Volume2
        size={18}
        className="text-white/70"
      />

      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={handleVolumeChange}
        className="w-full accent-[#8b5cf6]"
      />
    </div>
  );
}