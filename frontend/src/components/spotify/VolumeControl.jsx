import { useState } from "react";
import { Volume2 } from "lucide-react";
import { api } from "../../lib/api";
import Slider from "./Slider";

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

      <Slider
        value={volume}
        max={100}
        onValueChange={setVolume}
        onValueCommit={async (value) => {
          try {
            await api.put("/spotify/player/volume", {
              volume_percent: value,
            });
          } catch (err) {
            console.error(err);
          }
        }}
      />
    </div>
  );
}
