import {
  CheckCircle2,
  Music2,
  Timer,
} from "lucide-react";

export default function Footer({
  spotifyConnected,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">

      <div
        className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
          spotifyConnected
            ? "border-emerald-500/20 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <CheckCircle2
          size={15}
          className={
            spotifyConnected
              ? "text-emerald-400"
              : "text-white/40"
          }
        />

        <span className="text-xs font-medium text-white/70">
          {spotifyConnected
            ? "Connected"
            : "Disconnected"}
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">

        <Timer
          size={15}
          className="text-violet-300"
        />

        <span className="text-xs font-medium text-white/70">
          Focus Mode
        </span>

      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">

        <Music2
          size={15}
          className="text-violet-300"
        />

        <span className="text-xs font-medium text-white/70">
          Spotify Premium
        </span>

      </div>

    </div>
  );
}