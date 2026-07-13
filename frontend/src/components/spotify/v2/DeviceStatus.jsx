import { CheckCircle2, Music2 } from "lucide-react";

export default function DeviceStatus() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15">

          <CheckCircle2
            size={20}
            className="text-green-400"
          />

        </div>

        <div>

          <p className="text-sm font-semibold text-white">
            Spotify Premium Connected
          </p>

          <p className="text-xs text-white/45">
            Playback is active on your StudyOS device
          </p>

        </div>

      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">

        <Music2
          size={16}
          className="text-violet-400"
        />

        <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/55">
          Powered by Spotify
        </span>

      </div>

    </div>
  );
}