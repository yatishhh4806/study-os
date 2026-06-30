import { useState } from "react";
import {
  CloudRain,
  Coffee,
  Trees,
  Flame,
  Wind,
  Music2,
  Volume2,
} from "lucide-react";

const SOUNDS = [
  { key: "rain", label: "Rain", icon: CloudRain },
  { key: "cafe", label: "Cafe", icon: Coffee },
  { key: "forest", label: "Forest", icon: Trees },
  { key: "fireplace", label: "Fireplace", icon: Flame },
  { key: "white", label: "White Noise", icon: Wind },
  { key: "lofi", label: "Lofi", icon: Music2 },
];

export default function AmbientPanel() {
  const [active, setActive] = useState(null);
  const [volume, setVolume] = useState(55);
  const [autoBreak, setAutoBreak] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const accent = "#a855f7";
  const glow = "rgba(168,85,247,0.5)";

  const toggleSound = (key) => {
    setActive((prev) => (prev === key ? null : key));
  };

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform: translateY(0);} }
        @keyframes barPulse { 0%,100% { transform: scaleY(0.4);} 50% { transform: scaleY(1);} }
        .amb-card { animation: fadeUp 0.5s ease both; }
        .sound-row { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .sound-row:hover { transform: translateX(2px); border-color: rgba(168,85,247,0.35) !important; background: rgba(168,85,247,0.06) !important; }
        .sound-row:active { transform: translateX(2px) scale(0.99); }
        .eq-bar { transform-origin: bottom; animation: barPulse 0.9s ease-in-out infinite; }
        input[type="range"].amb-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          outline: none;
          background: linear-gradient(to right, ${accent} var(--val,55%), rgba(255,255,255,0.1) var(--val,55%));
        }
        input[type="range"].amb-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 4px ${glow}, 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        input[type="range"].amb-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type="range"].amb-slider::-moz-range-thumb {
          width: 18px; height: 18px; border: none; border-radius: 50%;
          background: #fff; box-shadow: 0 0 0 4px ${glow}, 0 2px 8px rgba(0,0,0,0.4); cursor: pointer;
        }
        .amb-check { transition: all 0.18s ease; }
        .amb-check:hover { border-color: rgba(168,85,247,0.5) !important; }
      `}</style>

      <div
        className="amb-card"
        style={{
          width: "100%",
          background: "linear-gradient(180deg, rgba(20,14,28,0.85), rgba(8,6,12,0.92))",
          border: "1px solid rgba(168,85,247,0.18)",
          borderLeft: `2px solid ${accent}`,
          borderRadius: 24,
          padding: "28px 24px 130px",
          backdropFilter: "blur(20px)",
          boxShadow: `0 30px 60px -25px rgba(0,0,0,0.65), -10px 0 40px -20px ${glow}`,
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 22,
            letterSpacing: -0.3,
          }}
        >
          Ambient
        </h2>

        {/* Sound list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {SOUNDS.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                className="sound-row"
                onClick={() => toggleSound(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: isActive
                    ? `1px solid ${accent}`
                    : "1px solid rgba(255,255,255,0.08)",
                  background: isActive ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: isActive ? `0 0 22px -8px ${glow}` : "none",
                }}
              >
                <Icon
                  size={17}
                  color={isActive ? accent : "rgba(255,255,255,0.5)"}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                    flex: 1,
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
                    {[0, 1, 2].map((b) => (
                      <div
                        key={b}
                        className="eq-bar"
                        style={{
                          width: 3,
                          height: 14,
                          borderRadius: 2,
                          background: accent,
                          animationDelay: `${b * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Volume */}
        <div style={{ marginBottom: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Volume2 size={15} />
              Volume
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="amb-slider"
            style={{ width: "100%", "--val": `${volume}%` }}
          />
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Auto Break", value: autoBreak, set: setAutoBreak },
            { label: "Notifications", value: notifications, set: setNotifications },
            { label: "Fullscreen", value: fullscreen, set: setFullscreen },
          ].map(({ label, value, set }) => (
            <label
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => set((v) => !v)}
            >
              <span style={{ fontSize: 14.5, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
                {label}
              </span>
              <div
                className="amb-check"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: value ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.25)",
                  background: value ? accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: value ? `0 0 12px -2px ${glow}` : "none",
                }}
              >
                {value && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.2 11.5L13 4.5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}