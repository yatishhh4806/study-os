import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Brain, Coffee } from "lucide-react";

const MODES = {
  focus: { label: "Focus", duration: 25 * 60, sub: "Deep Work", color: "#a855f7", glow: "rgba(168,85,247,0.55)" },
  short: { label: "Short Break", duration: 5 * 60, sub: "Stretch & Breathe", color: "#22d3ee", glow: "rgba(34,211,238,0.5)" },
  long: { label: "Long Break", duration: 15 * 60, sub: "Recharge", color: "#f472b6", glow: "rgba(244,114,182,0.5)" },
};

function format(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const total = MODES[mode].duration;
  const progress = 1 - secondsLeft / total;
  const accent = MODES[mode].color;
  const glow = MODES[mode].glow;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "focus") setSessions((c) => c + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = useCallback((m) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(m);
    setSecondsLeft(MODES[m].duration);
  }, []);

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(MODES[mode].duration);
  };

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  const stateLabel = secondsLeft === 0 ? "Complete" : running ? "Working" : "Paused";

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes pulseGlow { 0%,100% { opacity: 0.55; transform: scale(1);} 50% { opacity: 0.9; transform: scale(1.04);} }
        @keyframes floatSlow { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-10px);} }
        @keyframes shimmer { 0% { background-position: -200% center;} 100% { background-position: 200% center;} }
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px);} to { opacity:1; transform: translateY(0);} }
        .pt-card { animation: fadeUp 0.6s ease both; }
        .pt-tab { transition: all 0.25s cubic-bezier(.4,0,.2,1); }
        .pt-tab:hover { transform: translateY(-1px); }
        .pt-btn { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .pt-btn:hover { transform: translateY(-2px) scale(1.02); }
        .pt-btn:active { transform: translateY(0) scale(0.98); }
        .stat-card { transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-4px); border-color: rgba(168,85,247,0.45) !important; }
        .bar { transition: height 0.6s cubic-bezier(.4,0,.2,1); }
      `}</style>

      {/* ===== Timer Card ===== */}
      <div
        className="pt-card"
        style={{
          width: "100%",
          maxWidth: 460,
          background: "linear-gradient(180deg, rgba(20,14,28,0.85), rgba(10,7,15,0.9))",
          border: "1px solid rgba(168,85,247,0.18)",
          borderRadius: 32,
          padding: "32px 28px 36px",
          backdropFilter: "blur(20px)",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 80px -20px ${glow}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Mode tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            background: "rgba(255,255,255,0.03)",
            padding: 6,
            borderRadius: 16,
            marginBottom: 36,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {Object.entries(MODES).map(([key, m]) => {
            const active = key === mode;
            return (
              <button
                key={key}
                className="pt-tab"
                onClick={() => switchMode(key)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  background: active
                    ? `linear-gradient(135deg, ${m.color}, ${m.color}cc)`
                    : "transparent",
                  boxShadow: active ? `0 6px 18px -4px ${m.glow}` : "none",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Ring */}
        <div
          style={{
            position: "relative",
            width: 300,
            height: 300,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${glow}, transparent 65%)`,
              filter: "blur(18px)",
              opacity: running ? 0.8 : 0.35,
              animation: running ? "pulseGlow 2.6s ease-in-out infinite" : "none",
              transition: "opacity 0.4s ease",
            }}
          />
          <svg width="300" height="300" style={{ position: "relative", zIndex: 1, transform: "rotate(-90deg)" }}>
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke={accent}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              style={{
                transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
                filter: `drop-shadow(0 0 10px ${glow})`,
              }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 58,
                fontWeight: 800,
                letterSpacing: -1,
                fontVariantNumeric: "tabular-nums",
                background: "linear-gradient(135deg, #fff, #e5d9ff)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: `0 0 30px ${glow}`,
              }}
            >
              {format(secondsLeft)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: accent, letterSpacing: 0.5 }}>
              {MODES[mode].sub}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
          <button
            className="pt-btn"
            onClick={() => setRunning((r) => !r)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 30px",
              borderRadius: 16,
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
              boxShadow: `0 10px 30px -8px ${glow}`,
            }}
          >
            {running ? <Pause size={18} /> : <Play size={18} fill="#fff" />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            className="pt-btn"
            onClick={reset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 26px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>

        {/* Mini stats */}
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          <div
            style={{
              flex: 1,
              background: "rgba(168,85,247,0.07)",
              border: "1px solid rgba(168,85,247,0.18)",
              borderRadius: 18,
              padding: "18px 12px",
              textAlign: "center",
            }}
          >
            <Brain size={20} color={accent} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 26, fontWeight: 800 }}>{sessions}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Sessions Completed
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: "rgba(168,85,247,0.07)",
              border: "1px solid rgba(168,85,247,0.18)",
              borderRadius: 18,
              padding: "18px 12px",
              textAlign: "center",
            }}
          >
            <Coffee size={20} color={accent} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 22, fontWeight: 800 }}>{stateLabel}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Current State
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}