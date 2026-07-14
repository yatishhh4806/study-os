import { Volume1, Volume2, VolumeX } from "lucide-react";
import Slider from "../../../spotify/Slider";

export default function VolumeControl({
  volume = 60,
  onChange,
}) {
  const Icon =
    volume === 0
      ? VolumeX
      : volume < 50
      ? Volume1
      : Volume2;

  return (
    <div className="flex items-center gap-4">

      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">

        <Icon
          size={18}
          className="text-white/70"
        />

      </div>

      <div className="flex-1">

        <Slider
          value={volume}
          max={100}
          onValueChange={onChange}
          onValueCommit={onChange}
        />

      </div>

      <span className="w-11 text-right text-xs font-semibold tabular-nums text-violet-300">
        {Math.round(volume)}%
      </span>

    </div>
  );
}