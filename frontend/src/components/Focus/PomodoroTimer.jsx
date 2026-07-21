import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Brain, Coffee, Pencil, Check } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const MODES = {
  focus: { label: "Focus", sub: "Deep Work", color: "#a855f7", glow: "rgba(168,85,247,0.45)", defaultMin: 25 },
  short: { label: "Short Break", sub: "Stretch & Breathe", color: "#22d3ee", glow: "rgba(34,211,238,0.4)", defaultMin: 5 },
  long: { label: "Long Break", sub: "Recharge", color: "#f472b6", glow: "rgba(244,114,182,0.4)", defaultMin: 15 },
};

function format(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function PomodoroTimer({ onSessionLogged }) {
  const { user } = useAuth();
  const [mode, setMode] = useState("focus");
  const [customMins, setCustomMins] = useState(() => ({
    focus: user?.preferences?.pomodoroMinutes ?? MODES.focus.defaultMin,
    short: user?.preferences?.shortBreakMinutes ?? MODES.short.defaultMin,
    long: user?.preferences?.longBreakMinutes ?? MODES.long.defaultMin,
  }));
  const [editingDuration, setEditingDuration] = useState(false);
  const [draftMins, setDraftMins] = useState(String(MODES.focus.defaultMin));

  const currentDuration = customMins[mode] * 60;
  const [secondsLeft, setSecondsLeft] = useState(currentDuration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const sessionIdRef = useRef(null);
  const distractionsRef = useRef(0);

  const total = currentDuration;
  const progress = 1 - secondsLeft / total;
  const accent = MODES[mode].color;
  const glow = MODES[mode].glow;

  // BUG FIX: `user` typically loads asynchronously (null on first render,
  // populated once the auth fetch resolves), so the useState initializer
  // above can lock in hardcoded 25/5/15 defaults before real preferences
  // ever arrive — and it never re-checks after that, even if you go change
  // durations on the Settings page. This effect re-syncs whenever
  // preferences change, as long as nothing active would get yanked out
  // from under the user (a running timer, or a duration they're editing).
  useEffect(() => {
    if (!user?.preferences || running || editingDuration) return;
    setCustomMins((prev) => {
      const next = {
        focus: user.preferences.pomodoroMinutes ?? MODES.focus.defaultMin,
        short: user.preferences.shortBreakMinutes ?? MODES.short.defaultMin,
        long: user.preferences.longBreakMinutes ?? MODES.long.defaultMin,
      };
      if (prev.focus === next.focus && prev.short === next.short && prev.long === next.long) {
        return prev;
      }
      return next;
    });
  }, [
    user?.preferences?.pomodoroMinutes,
    user?.preferences?.shortBreakMinutes,
    user?.preferences?.longBreakMinutes,
    running,
    editingDuration,
  ]);

  // Keep the visible countdown in lockstep with customMins for the active
  // mode whenever it changes while idle (e.g. after the sync above, or
  // after switching modes) — otherwise secondsLeft can go stale.
  useEffect(() => {
    if (running) return;
    setSecondsLeft(customMins[mode] * 60);
  }, [customMins, mode, running]);

  useEffect(() => {
    if (!running || mode !== "focus" || !sessionIdRef.current) return;
    const onVisibilityChange = () => {
      if (document.hidden) distractionsRef.current += 1;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [running, mode]);

  const completeBackendSession = useCallback(async () => {
    const id = sessionIdRef.current;
    if (!id) return;
    sessionIdRef.current = null;
    try {
      await api.patch(`/focus-sessions/${id}/complete`, {
        distractions: distractionsRef.current,
      });
      distractionsRef.current = 0;
      onSessionLogged?.();
    } catch (err) {
      console.error("Failed to log completed focus session:", err);
    }
  }, [onSessionLogged]);

  const abandonBackendSession = useCallback(async () => {
    const id = sessionIdRef.current;
    if (!id) return;
    sessionIdRef.current = null;
    distractionsRef.current = 0;
    try {
      await api.delete(`/focus-sessions/${id}`);
    } catch (err) {
      console.error("Failed to abandon focus session:", err);
    }
  }, []);

  // BUG FIX: `autoStartBreaks` was saved to the DB from Settings but never
  // read anywhere in this component — a completely dead toggle. This picks
  // the next mode when a session ends and, if the preference is on (and
  // we're not landing back on focus, which should always require a manual
  // Start), auto-starts it instead of just sitting on Paused/Complete.
  const advanceAfterCompletion = useCallback(
    (finishedMode) => {
      const nextMode = finishedMode === "focus" ? "short" : "focus";
      const autoStart = finishedMode === "focus" && !!user?.preferences?.autoStartBreaks;

      setMode(nextMode);
      setSecondsLeft(customMins[nextMode] * 60);
      setRunning(autoStart);
    },
    [customMins, user?.preferences?.autoStartBreaks]
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            const finishedMode = mode;
            if (finishedMode === "focus") {
              setSessions((c) => c + 1);
              completeBackendSession();
            }
            advanceAfterCompletion(finishedMode);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, completeBackendSession, advanceAfterCompletion]);

  const switchMode = useCallback(async (m) => {
    if (m === mode) return;
    clearInterval(intervalRef.current);
    setRunning(false);
    setEditingDuration(false);
    if (mode === "focus" && sessionIdRef.current) {
      await abandonBackendSession();
    }
    setMode(m);
    setSecondsLeft(customMins[m] * 60);
  }, [mode, customMins, abandonBackendSession]);

  const handlePlayPause = useCallback(async () => {
    if (running) {
      setRunning(false);
      return;
    }

    if (mode === "focus" && !sessionIdRef.current) {
      try {
        const { data } = await api.post("/focus-sessions", {
          mode: "pomodoro",
          plannedMinutes: customMins.focus,
        });
        sessionIdRef.current = data.session._id;
        distractionsRef.current = 0;
      } catch (err) {
        console.error("Failed to start focus session:", err);
        return;
      }
    }

    setRunning(true);
  }, [running, mode, customMins]);

  const reset = useCallback(async () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    if (mode === "focus" && sessionIdRef.current) {
      await abandonBackendSession();
    }
    setSecondsLeft(customMins[mode] * 60);
  }, [mode, customMins, abandonBackendSession]);

  const startEditing = () => {
    if (running) return;
    setDraftMins(String(customMins[mode]));
    setEditingDuration(true);
  };

  const saveDuration = () => {
    const parsed = parseInt(draftMins, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 480) {
      setCustomMins((prev) => ({ ...prev, [mode]: parsed }));
      setSecondsLeft(parsed * 60);
    }
    setEditingDuration(false);
  };

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  const stateLabel = secondsLeft === 0 ? "Complete" : running ? "Working" : "Paused";

  return (
    <div className="w-full text-white flex flex-col items-center gap-8 relative select-none">
      <style>{`
        @keyframes ptPulseGlow { 
          0%, 100% { opacity: 0.45; transform: scale(1); filter: blur(24px); } 
          50% { opacity: 0.75; transform: scale(1.05); filter: blur(32px); } 
        }
        @keyframes ptFadeUp { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .pt-card { animation: ptFadeUp 0.5s ease both; }
        .pt-tab { transition: all 0.25s cubic-bezier(.4,0,.2,1); }
        .pt-tab:hover { transform: translateY(-1px); }
        .pt-btn { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .pt-btn:hover { transform: translateY(-2px) scale(1.02); }
        .pt-btn:active { transform: translateY(0) scale(0.98); }
        .stat-box { transition: all 0.3s ease; }
        .stat-box:hover { transform: translateY(-3px); }
      `}</style>

      <div
        className="pt-card w-full max-w-115 bg-linear-to-b from-[#140e1c]/90 to-[#0a070f]/95 border rounded-4xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative z-10"
        style={{
          borderColor: `${accent}25`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.01), 0 30px 60px -20px rgba(0,0,0,0.65), 0 0 60px -25px ${glow}`,
        }}
      >
        {/* Mode Selector Tab Bar */}
        <div className="flex gap-1.5 bg-white/3 p-1.5 rounded-2xl mb-8 border border-white/5">
          {Object.entries(MODES).map(([key, m]) => {
            const active = key === mode;
            return (
              <button
                key={key}
                className="pt-tab flex-1 py-2.5 rounded-xl border-0 cursor-pointer text-xs md:text-sm font-semibold tracking-wide transition-all duration-300"
                onClick={() => switchMode(key)}
                style={{
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

        {/* Circular Timer Visual */}
        <div className="relative w-70 h-70 md:w-75 md:h-75 mx-auto flex items-center justify-center">
          {/* Animated Ambient Color Sphere */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-700"
            style={{
              background: `radial-gradient(circle, ${glow}, transparent 70%)`,
              opacity: running ? 0.8 : 0.35,
              animation: running ? "ptPulseGlow 3s ease-in-out infinite" : "none",
            }}
          />
          
          <svg className="relative z-10 w-full h-full max-w-[300px] max-h-[300px] -rotate-90">
            <circle cx="150" cy="150" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
            <circle
              cx="150"
              cy="150"
              r={radius}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              style={{
                transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
                filter: `drop-shadow(0 0 8px ${glow})`,
              }}
            />
          </svg>

          {/* Core Timer Overlay Content */}
          <div className="absolute z-10 flex flex-col items-center gap-1">
            <div className="text-5xl md:text-6xl font-extrabold tracking-tighter tabular-nums bg-gradient-to-br from-white to-[#e5d9ff] bg-clip-text text-transparent drop-shadow-sm">
              {format(secondsLeft)}
            </div>
            
            <div
              className="text-xs md:text-sm font-bold tracking-widest uppercase transition-colors duration-500"
              style={{ color: accent }}
            >
              {MODES[mode].sub}
            </div>

            {!running && (
              editingDuration ? (
                <div className="flex items-center gap-2 mt-3 bg-white/[0.04] p-1 pl-3 pr-1 rounded-xl border border-white/10">
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={draftMins}
                    onChange={(e) => setDraftMins(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveDuration()}
                    autoFocus
                    className="w-10 bg-transparent text-white text-sm font-bold text-center outline-none border-b border-transparent focus:border-violet-400"
                  />
                  <span className="text-xs text-white/40 font-medium">min</span>
                  <button
                    onClick={saveDuration}
                    className="p-1.5 rounded-lg border-0 cursor-pointer flex items-center justify-center text-white"
                    style={{ background: accent }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.03] text-white/50 text-xs font-semibold hover:bg-white/[0.06] hover:text-white/80 transition cursor-pointer"
                >
                  <Pencil size={11} />
                  <span>{customMins[mode]}m</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Play/Pause/Reset Control Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            className="pt-btn flex items-center gap-2 px-8 py-3.5 rounded-2xl border-0 cursor-pointer text-sm font-bold text-white shadow-lg"
            onClick={handlePlayPause}
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              boxShadow: `0 8px 24px -6px ${glow}`,
            }}
          >
            {running ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} fill="#fff" />}
            <span>{running ? "Pause" : "Start"}</span>
          </button>
          
          <button
            className="pt-btn flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-white/10 cursor-pointer text-sm font-bold text-white bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
            onClick={reset}
          >
            <RotateCcw size={15} strokeWidth={2.5} />
            <span>Reset</span>
          </button>
        </div>

        {/* Bottom State Statistics */}
        <div className="flex gap-4 w-full mt-8">
          <div
            className="stat-box flex-1 rounded-2xl p-4 text-center border transition-all duration-300"
            style={{
              background: `${accent}07`,
              borderColor: `${accent}1e`,
            }}
          >
            <Brain size={18} className="mx-auto mb-2 opacity-80" style={{ color: accent }} />
            <div className="text-2xl font-extrabold text-white">{sessions}</div>
            <div className="text-[11px] font-semibold text-white/45 tracking-wide uppercase mt-1">
              Sessions
            </div>
          </div>
          
          <div
            className="stat-box flex-1 rounded-2xl p-4 text-center border transition-all duration-300"
            style={{
              background: `${accent}07`,
              borderColor: `${accent}1e`,
            }}
          >
            <Coffee size={18} className="mx-auto mb-2 opacity-80" style={{ color: accent }} />
            <div className="text-xl font-extrabold text-white truncate">{stateLabel}</div>
            <div className="text-[11px] font-semibold text-white/45 tracking-wide uppercase mt-1">
              State
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}