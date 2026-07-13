import { useState } from "react";
import {
  Volume2,
  Volume1,
  VolumeX,
} from "lucide-react";

import { api } from "../../../lib/api";
import Slider from "../Slider";

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
      setTimeout(() => setLoading(false), 120);
    }
  }

  const Icon =
    volume === 0
      ? VolumeX
      : volume < 50
      ? Volume1
      : Volume2;

  return (
    <div className="flex items-center gap-5">

      <Icon
        size={20}
        className="text-white/55 shrink-0"
      />

      <div className="flex-1">

        <Slider
          value={volume}
          max={100}
          onValueChange={setVolume}
          onValueCommit={updateVolume}
        />

      </div>

      <span className="w-10 text-right text-xs font-semibold tabular-nums text-violet-300">
        {Math.round(volume)}%
      </span>

    </div>
  );
}