import { useMemo, useState } from "react";
import {
  Brain,
  Trophy,
  Clock,
  Flame,
  TrendingUp,
  Target,
  X,
  CalendarRange,
} from "lucide-react";

/**
 * ── DATA CONTRACT ──────────────────────────────────────────────
 * This panel is driven by a `sessions` array (completed/saved sessions
 * from the backend) plus an optional `liveMinutes` number representing
 * an in-progress focus session that hasn't been saved yet — this is
 * what makes the panel update in real time while the timer is running,
 * instead of only refreshing once a session finishes.
 * ──────────────────────────────────────────────────────────────
 */

const SAMPLE_SESSIONS = [
  {
    id: "1",
    type: "focus",
    date: "2026-06-30",
    startTime: "08:10",
    durationMin: 25,
    plannedMin: 25,
    distractions: 0,
    completed: true,
  },
  {
    id: "2",
    type: "focus",
    date: "2026-06-30",
    startTime: "19:05",
    durationMin: 25,
    plannedMin: 25,
    distractions: 1,
    completed: true,
  },
  {
    id: "3",
    type: "focus",
    date: "2026-06-30",
    startTime: "19:40",
    durationMin: 52,
    plannedMin: 50,
    distractions: 0,
    completed: true,
  },
  {
    id: "4",
    type: "focus",
    date: "2026-06-30",
    startTime: "20:45",
    durationMin: 18,
    plannedMin: 25,
    distractions: 2,
    completed: false,
  },
  {
    id: "5",
    type: "focus",
    date: "2026-06-29",
    startTime: "21:00",
    durationMin: 25,
    plannedMin: 25,
    distractions: 1,
    completed: true,
  },
  {
    id: "6",
    type: "focus",
    date: "2026-06-28",
    startTime: "18:00",
    durationMin: 75,
    plannedMin: 75,
    distractions: 0,
    completed: true,
  },
  {
    id: "7",
    type: "focus",
    date: "2026-06-27",
    startTime: "09:00",
    durationMin: 50,
    plannedMin: 50,
    distractions: 1,
    completed: true,
  },
  {
    id: "8",
    type: "focus",
    date: "2026-06-26",
    startTime: "20:00",
    durationMin: 30,
    plannedMin: 50,
    distractions: 3,
    completed: false,
  },
  {
    id: "9",
    type: "focus",
    date: "2026-06-25",
    startTime: "17:30",
    durationMin: 100,
    plannedMin: 100,
    distractions: 0,
    completed: true,
  },
  {
    id: "10",
    type: "focus",
    date: "2026-06-24",
    startTime: "10:00",
    durationMin: 25,
    plannedMin: 25,
    distractions: 0,
    completed: true,
  },
];

const DEFAULT_TARGET_HOURS = 4;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

// liveMinutes: an in-progress, not-yet-saved focus session's elapsed
// minutes. Added on top of today's saved totals so the panel reflects
// the session actually happening right now, not just past ones.
function computeStats(sessions, liveMinutes = 0) {
  const today = todayStr();
  const todays = sessions.filter((s) => s.type === "focus" && s.date === today);

  const sessionsCompleted = todays.filter((s) => s.completed).length;
  const savedFocusMinutes = todays.reduce(
    (sum, s) => sum + (s.durationMin || 0),
    0,
  );
  const focusMinutes = savedFocusMinutes + liveMinutes;
  const distractions = todays.reduce(
    (sum, s) => sum + (s.distractions || 0),
    0,
  );
  const longestSavedSession = todays.reduce(
    (max, s) => Math.max(max, s.durationMin || 0),
    0,
  );
  const longestSession = Math.max(longestSavedSession, liveMinutes);

  // Consistency: how much of planned time was actually completed today
  const plannedTotal = todays.reduce((sum, s) => sum + (s.plannedMin || 0), 0);
  const consistency =
    plannedTotal > 0 ? Math.round((savedFocusMinutes / plannedTotal) * 100) : 0;

  // Peak focus period: 2-hour bucket with the most accumulated focus minutes (all-time)
  const buckets = new Array(12).fill(0); // 12 buckets of 2 hours
  sessions
    .filter((s) => s.type === "focus" && s.startTime)
    .forEach((s) => {
      const hour = parseInt(s.startTime.split(":")[0], 10);
      const bucket = Math.floor(hour / 2);
      buckets[bucket] += s.durationMin || 0;
    });
  let peakBucket = 0;
  buckets.forEach((v, i) => {
    if (v > buckets[peakBucket]) peakBucket = i;
  });
  const peakStartHour = peakBucket * 2;
  const peakEndHour = peakStartHour + 2;
  const fmtHour = (h) => {
    const period = h >= 12 ? "PM" : "AM";
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ${period}`;
  };
  const peakPeriod =
    buckets[peakBucket] > 0
      ? `${fmtHour(peakStartHour)} - ${fmtHour(peakEndHour)}`
      : "Not enough data";

  const totalMinutesRounded = Math.round(focusMinutes);
  const hours = Math.floor(totalMinutesRounded / 60);
  const mins = totalMinutesRounded % 60;
  const focusTimeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    sessionsCompleted,
    focusMinutes: totalMinutesRounded,
    focusTimeLabel,
    distractions,
    longestSession: Math.round(longestSession),
    consistency,
    peakPeriod,
    isLive: liveMinutes > 0,
  };
}

function computeWeeklyReport(sessions, liveMinutes = 0) {
  const today = todayStr();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    const savedMinutes = sessions
      .filter((s) => s.type === "focus" && s.date === dateStr)
      .reduce((sum, s) => sum + (s.durationMin || 0), 0);
    const dayMinutes =
      dateStr === today ? savedMinutes + liveMinutes : savedMinutes;
    days.push({ date: dateStr, label, minutes: Math.round(dayMinutes) });
  }
  return days;
}

function generateInsights(stats, sessions) {
  const insights = [];
  const today = todayStr();
  const todays = sessions.filter((s) => s.type === "focus" && s.date === today);

  if (stats.isLive) {
    insights.push("You're mid-session right now — keep going!");
  } else if (stats.sessionsCompleted > 0) {
    insights.push(
      `You completed ${stats.sessionsCompleted} session${stats.sessionsCompleted === 1 ? "" : "s"} today.`,
    );
  } else {
    insights.push(
      "No sessions completed yet today — start your first Focus block.",
    );
  }

  if (stats.longestSession > 0) {
    insights.push(
      `Your longest focus streak was ${stats.longestSession} minutes.`,
    );
  }

  if (stats.peakPeriod !== "Not enough data") {
    insights.push(`You focus best between ${stats.peakPeriod}.`);
  }

  const abandoned = todays.filter((s) => !s.completed).length;
  if (abandoned > 0) {
    insights.push(
      `You abandoned ${abandoned} session${abandoned === 1 ? "" : "s"} today before it finished.`,
    );
  }

  if (stats.distractions > 0) {
    const rate =
      todays.length > 0 ? (stats.distractions / todays.length).toFixed(1) : 0;
    insights.push(
      `You averaged ${rate} distraction${rate === "1.0" ? "" : "s"} per session today.`,
    );
  }

  if (stats.consistency >= 90) {
    insights.push(
      `You're highly consistent — ${stats.consistency}% of planned focus time completed.`,
    );
  } else if (stats.consistency > 0) {
    insights.push(
      `You're at ${stats.consistency}% consistency today — small room to improve.`,
    );
  }

  return insights;
}

export default function FocusAnalytics({
  sessions = SAMPLE_SESSIONS,
  liveMinutes = 0,
}) {
  const stats = useMemo(
    () => computeStats(sessions, liveMinutes),
    [sessions, liveMinutes],
  );
  const insights = useMemo(
    () => generateInsights(stats, sessions),
    [stats, sessions],
  );
  const weeklyReport = useMemo(
    () => computeWeeklyReport(sessions, liveMinutes),
    [sessions, liveMinutes],
  );

  const [targetHours, setTargetHours] = useState(DEFAULT_TARGET_HOURS);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [draftTarget, setDraftTarget] = useState(String(DEFAULT_TARGET_HOURS));

  const targetMinutes = targetHours * 60;
  const goalProgress =
    targetMinutes > 0
      ? Math.min((stats.focusMinutes / targetMinutes) * 100, 100)
      : 0;
  const remainingMin = Math.max(targetMinutes - stats.focusMinutes, 0);
  const remainingLabel =
    remainingMin === 0
      ? "Goal reached"
      : `${Math.floor(remainingMin / 60)}h ${remainingMin % 60}m left`;

  const weekTotalMin = weeklyReport.reduce((sum, d) => sum + d.minutes, 0);
  const weekAvgMin = Math.round(weekTotalMin / 7);
  const maxDayMin = Math.max(...weeklyReport.map((d) => d.minutes), 1);

  const openTargetModal = () => {
    setDraftTarget(String(targetHours));
    setShowTargetModal(true);
  };

  const saveTarget = () => {
    const parsed = parseFloat(draftTarget);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetHours(parsed);
    }
    setShowTargetModal(false);
  };

  const accent = "#a855f7";
  const glow = "rgba(168,85,247,0.5)";

  return (
    <div
      style={{
        width: "100%",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform: translateY(0);} }
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .fa-card { animation: fadeUp 0.5s ease both; }
        .fa-row { transition: all 0.2s ease; }
        .fa-row:hover { border-color: rgba(168,85,247,0.35) !important; transform: translateY(-1px); }
        .fa-insight { transition: all 0.2s ease; animation: fadeUp 0.4s ease both; }
        .fa-insight:hover { border-color: rgba(168,85,247,0.35) !important; background: rgba(168,85,247,0.05) !important; }
        @keyframes growBar { from { width: 0%; } }
        .fa-bar-fill { animation: growBar 1s cubic-bezier(.4,0,.2,1) both; }
        .fa-live-dot { animation: livePulse 1.4s ease-in-out infinite; }
      `}</style>

      <div
        className="fa-card"
        style={{
          width: "100%",
          background:
            "linear-gradient(180deg, rgba(20,14,28,0.85), rgba(8,6,12,0.92))",
          border: "1px solid rgba(168,85,247,0.18)",
          borderRight: `2px solid ${accent}`,
          borderRadius: 24,
          padding: "28px 24px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: `0 30px 60px -25px rgba(0,0,0,0.65), 0 0 60px -30px ${glow}, 10px 0 40px -20px ${glow}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <Brain size={22} color={accent} style={{ flexShrink: 0 }} />
            <h2
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: -0.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Focus Analytics
            </h2>
            {stats.isLive && (
              <span
                className="fa-live-dot"
                title="Live session in progress"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22d3ee",
                  boxShadow: "0 0 8px #22d3ee",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
          <button
            onClick={openTargetModal}
            className="fa-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 10px",
              borderRadius: 10,
              border: "1px solid rgba(168,85,247,0.3)",
              background: "rgba(168,85,247,0.1)",
              color: accent,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <Target size={12} />
            Set Target
          </button>
        </div>

        {/* Daily Goal Progress */}
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 16,
            border: `1px solid ${accent}55`,
            background: "rgba(168,85,247,0.1)",
            marginBottom: 12,
            boxShadow: `0 0 30px -16px ${glow}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 14.5, color: "rgba(255,255,255,0.85)" }}>
              Daily Goal &middot; {targetHours}h target
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
              {Math.round(goalProgress)}%
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              className="fa-bar-fill"
              style={{
                height: "100%",
                width: `${goalProgress}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${accent}, #22d3ee)`,
                boxShadow: `0 0 12px -2px ${glow}`,
                transition: "width .25s linear",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.5)",
              marginTop: 8,
            }}
          >
            {stats.focusTimeLabel} of {targetHours}h &middot; {remainingLabel}
          </div>
        </div>

        {/* Sessions Completed */}
        <div
          className="fa-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14.5,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <Trophy size={17} color={accent} />
            Sessions Completed
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
            {stats.sessionsCompleted}
          </span>
        </div>

        {/* Focus Time */}
        <div
          className="fa-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14.5,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <Clock size={17} color={accent} />
            Focus Time
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
            {stats.focusTimeLabel}
          </span>
        </div>

        {/* Longest Session */}
        <div
          className="fa-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14.5,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <Flame size={17} color={accent} />
            Longest Session
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
            {stats.longestSession}m
          </span>
        </div>

        {/* Peak Focus Period */}
        <div
          className="fa-row"
          style={{
            padding: "16px 18px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 4,
            }}
          >
            <TrendingUp size={15} color={accent} />
            Peak Focus Period
          </span>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>
            {stats.peakPeriod}
          </div>
        </div>

        {/* Weekly Progress Report */}
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <CalendarRange size={15} color={accent} />
              7-Day Report
            </span>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
              avg {Math.floor(weekAvgMin / 60)}h {weekAvgMin % 60}m/day
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              height: 84,
            }}
          >
            {weeklyReport.map((d) => {
              const h = Math.max(
                (d.minutes / maxDayMin) * 100,
                d.minutes > 0 ? 6 : 2,
              );
              const metGoal = d.minutes >= targetMinutes && targetMinutes > 0;
              return (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      borderRadius: "6px 6px 3px 3px",
                      background: metGoal
                        ? `linear-gradient(180deg, #22d3ee, ${accent})`
                        : `linear-gradient(180deg, ${accent}cc, ${accent}33)`,
                      transition: "height 0.6s cubic-bezier(.4,0,.2,1)",
                    }}
                    title={`${d.label}: ${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m`}
                  />
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 6,
                    }}
                  >
                    {d.label[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.45)",
              marginTop: 10,
            }}
          >
            {Math.floor(weekTotalMin / 60)}h {weekTotalMin % 60}m focused this
            week
          </div>
        </div>
      </div>

      {/* Set Target Modal */}
      {showTargetModal && (
        <div
          onClick={() => setShowTargetModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            animation: "fadeUp 0.2s ease both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 320,
              background:
                "linear-gradient(180deg, rgba(24,16,32,0.97), rgba(10,7,15,0.98))",
              border: `1px solid ${accent}55`,
              borderRadius: 20,
              padding: 24,
              boxShadow: `0 30px 60px -20px rgba(0,0,0,0.7), 0 0 60px -20px ${glow}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                <Target size={18} color={accent} />
                Set Focus Target
              </span>
              <button
                onClick={() => setShowTargetModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <label
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 8,
                display: "block",
              }}
            >
              Daily focus hours goal
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={draftTarget}
                onChange={(e) => setDraftTarget(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  outline: "none",
                }}
              />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                hours / day
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {[2, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  onClick={() => setDraftTarget(String(h))}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 10,
                    border:
                      draftTarget === String(h)
                        ? `1px solid ${accent}`
                        : "1px solid rgba(255,255,255,0.1)",
                    background:
                      draftTarget === String(h)
                        ? "rgba(168,85,247,0.15)"
                        : "transparent",
                    color:
                      draftTarget === String(h)
                        ? "#fff"
                        : "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {h}
                </button>
              ))}
            </div>

            <button
              onClick={saveTarget}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
                boxShadow: `0 10px 24px -8px ${glow}`,
              }}
            >
              Save Target
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
