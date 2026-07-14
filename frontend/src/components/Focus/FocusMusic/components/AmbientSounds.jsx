import {
  CloudRain,
  Coffee,
  Flame,
  Music2,
  Trees,
} from "lucide-react";

const ICONS = {
  rain: CloudRain,
  cafe: Coffee,
  forest: Trees,
  fireplace: Flame,
  lofi: Music2,
};

export default function AmbientSounds({
  sounds = [],
  activeSound,
  onToggle,
}) {
  return (
    <div>

      <div className="mb-5 flex items-center justify-between">

        <h3 className="text-lg font-semibold text-white">
          Ambient Sounds
        </h3>

        <span className="text-xs uppercase tracking-[0.2em] text-white/35">
          Optional
        </span>

      </div>

      <div className="grid grid-cols-2 gap-3">

        {sounds.map((sound) => {
          const Icon = ICONS[sound.key] || Music2;

          const active = activeSound === sound.key;

          return (
            <button
              key={sound.key}
              onClick={() => onToggle(sound.key)}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 ${
                active
                  ? "border-violet-500 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,.2)]"
                  : "border-white/10 bg-white/[0.03] hover:border-violet-400/30 hover:bg-white/[0.05]"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  active
                    ? "bg-violet-500/20"
                    : "bg-white/[0.05]"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-violet-300"
                      : "text-white/60"
                  }
                />
              </div>

              <div className="text-left">

                <p className="font-medium text-white">
                  {sound.label}
                </p>

                <p className="text-xs text-white/40">
                  {active ? "Playing" : "Tap to play"}
                </p>

              </div>

            </button>
          );
        })}

      </div>

    </div>
  );
}