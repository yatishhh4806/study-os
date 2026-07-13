import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { api } from "../../lib/api";
import Slider from "./Slider";

export default function VolumeControl() {
  const [volume, setVolume] = useState(60);
  const [loading, setLoading] = useState(false);

  async function updateVolume(value) {
    if (loading) return;

    setLoading(true);

    try {
      await api.put("/spotify/player/volume", {
        volume_percent: Math.round(value),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      {volume === 0 ? (
        <VolumeX
          size={18}
          className="text-white/60"
        />
      ) : (
        <Volume2
          size={18}
          className="text-white/60"
        />
      )}

      <Slider
        value={volume}
        max={100}
        onValueChange={setVolume}
        onValueCommit={updateVolume}
      />

      <span className="w-8 text-right text-xs text-white/50">
        {volume}
      </span>
    </div>
  );
}