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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Ambient Atmosphere
        </h3>
        <span className="text-xs uppercase tracking-[0.2em] text-white/35">
          Mixer
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
              className={`group flex items-center gap-3 rounded-2xl border p-3.5 transition-all duration-300 cursor-pointer ${
                active
                  ? "border-violet-500/40 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.02]"
                  : "border-white/5 bg-white/[0.02] hover:border-violet-500/25 hover:bg-white/[0.04]"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                  active
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-white/[0.04] text-white/60 group-hover:text-white/80"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "animate-pulse" : ""}
                />
              </div>

              <div className="text-left min-w-0 flex-1">
                <p className="font-semibold text-sm text-white truncate">
                  {sound.label}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-white/40">
                    {active ? "Playing" : "Off"}
                  </span>
                  {active && (
                    <div className="flex items-end gap-[2px] h-2.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-[1.5px] rounded-full bg-violet-400"
                          style={{
                            height: "100%",
                            animation: `ambient-eq 0.8s ease-in-out ${i * 0.15}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes ambient-eq {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}