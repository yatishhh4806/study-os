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
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

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

  const plannedTotal = todays.reduce((sum, s) => sum + (s.plannedMin || 0), 0);
  const consistency =
    plannedTotal > 0 ? Math.round((savedFocusMinutes / plannedTotal) * 100) : 0;

  const buckets = new Array(12).fill(0);
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
  loading = false,
  sessions = [],
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

  if (loading) {
    return (
      <div className="w-full select-none">
        <div className="fa-card animate-pulse w-full bg-linear-to-b from-[#140e1c]/90 to-[#08060c]/95 border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="mb-6 h-7 w-36 rounded-lg bg-white/10" />
          <div className="mb-6 h-24 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-white/5" />
            ))}
          </div>
          <div className="mt-6 h-28 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white select-none">
      <style>{`
        @keyframes faFadeUp { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform: translateY(0);} }
        @keyframes faLivePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .fa-card { animation: faFadeUp 0.5s ease both; }
        .fa-row { transition: all 0.25s ease; }
        .fa-row:hover { border-color: rgba(168,85,247,0.3) !important; transform: translateY(-1.5px); }
        .fa-insight { transition: all 0.2s ease; }
        .fa-insight:hover { background: rgba(168,85,247,0.04) !important; }
        @keyframes faGrowBar { from { width: 0%; } }
        .fa-bar-fill { animation: faGrowBar 1s cubic-bezier(.4,0,.2,1) both; }
        .fa-live-dot { animation: faLivePulse 1.4s ease-in-out infinite; }
      `}</style>

      <div className="fa-card w-full bg-linear-to-b from-[#140e1c]/90 to-[#08060c]/95 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative">
        {/* Title Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <Brain size={20} className="shrink-0" style={{ color: accent }} />
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white truncate">
              Focus Analytics
            </h2>
            {stats.isLive && (
              <span
                className="fa-live-dot shrink-0 w-2 h-2 rounded-full bg-cyan-400"
                title="Live session in progress"
              />
            )}
          </div>

          <button
            onClick={openTargetModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/3 text-purple-400 text-xs font-bold transition hover:border-white/20 hover:bg-white/6 cursor-pointer shrink-0"
          >
            <Target size={12} />
            <span>Target</span>
          </button>
        </div>

        {/* Daily Goal Progress Bar Card */}
        <div className="p-4 md:p-5 rounded-2xl border border-white/10 bg-white/2 mb-5 transition-all duration-300">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-sm font-semibold text-white/80">
              Daily Goal &middot; {targetHours}h
            </span>
            <span className="text-lg font-black text-white">
              {Math.round(goalProgress)}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="fa-bar-fill h-full rounded-full bg-linear-to-r from-purple-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${goalProgress}%` }}
            />
          </div>

          <div className="text-xs text-white/40 mt-2 font-medium">
            {stats.focusTimeLabel} of {targetHours}h &middot; {remainingLabel}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1 gap-3 mb-6">
          <div className="fa-row flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4">
            <span className="flex items-center gap-2.5 text-sm text-white/80">
              <Trophy size={16} className="shrink-0" style={{ color: accent }} />
              Sessions
            </span>
            <span className="text-lg font-extrabold text-white">
              {stats.sessionsCompleted}
            </span>
          </div>

          <div className="fa-row flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4">
            <span className="flex items-center gap-2.5 text-sm text-white/80">
              <Clock size={16} className="shrink-0" style={{ color: accent }} />
              Focus Time
            </span>
            <span className="text-lg font-extrabold text-white">
              {stats.focusTimeLabel}
            </span>
          </div>

          <div className="fa-row flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
            <span className="flex items-center gap-2.5 text-sm text-white/80">
              <Flame size={16} className="shrink-0" style={{ color: accent }} />
              Longest
            </span>
            <span className="text-lg font-extrabold text-white">
              {stats.longestSession}m
            </span>
          </div>

          <div className="fa-row flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4">
            <span className="flex items-center gap-2.5 text-sm text-white/80">
              <TrendingUp size={16} className="shrink-0" style={{ color: accent }} />
              Peak Period
            </span>
            <span className="text-sm font-bold text-white truncate max-w-30" title={stats.peakPeriod}>
              {stats.peakPeriod}
            </span>
          </div>
        </div>

        {/* Weekly Progress Report */}
        <div className="p-4 md:p-5 rounded-2xl border border-white/5 bg-white/2 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-wider">
              <CalendarRange size={14} style={{ color: accent }} />
              7-Day Report
            </span>
            <span className="text-[11px] text-white/40 font-semibold">
              avg {Math.floor(weekAvgMin / 60)}h {weekAvgMin % 60}m/day
            </span>
          </div>

          <div className="flex items-end gap-2.5 h-20 mb-3.5">
            {weeklyReport.map((d) => {
              const h = Math.max(
                (d.minutes / maxDayMin) * 100,
                d.minutes > 0 ? 8 : 3,
              );
              const metGoal = d.minutes >= targetMinutes && targetMinutes > 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute -top-8 scale-0 group-hover:scale-100 transition-all duration-200 bg-black/80 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-30 pointer-events-none border border-white/10">
                    {Math.floor(d.minutes / 60)}h {d.minutes % 60}m
                  </div>
                  <div
                    className="w-full rounded-t-md transition-all duration-500 ease-out"
                    style={{
                      height: `${h}%`,
                      background: metGoal
                        ? `linear-gradient(180deg, #22d3ee, ${accent})`
                        : `linear-gradient(180deg, ${accent}cc, ${accent}22)`,
                    }}
                  />
                  <span className="text-[10px] text-white/40 mt-1.5 font-bold uppercase">
                    {d.label[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-white/40 font-medium">
            {Math.floor(weekTotalMin / 60)}h {weekTotalMin % 60}m focused this week
          </div>
        </div>

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="p-4 rounded-2xl border border-white/5 bg-white/1">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">
              Focus Insights
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              {insights.map((insight, idx) => (
                <li
                  key={idx}
                  className="fa-insight flex items-start gap-2 p-2 rounded-lg transition-all duration-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Set Target Modal */}
      {showTargetModal && (
        <div
          onClick={() => setShowTargetModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[320px] bg-linear-to-b from-[#181020]/95 to-[#0a070f]/98 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
                <Target size={16} style={{ color: accent }} />
                Set Focus Target
              </span>
              <button
                onClick={() => setShowTargetModal(false)}
                className="bg-transparent border-0 text-white/50 hover:text-white cursor-pointer p-1 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <label className="text-xs text-white/55 mb-2 block font-medium">
              Daily focus hours goal
            </label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={draftTarget}
                onChange={(e) => setDraftTarget(e.target.value)}
                autoFocus
                className="flex-1 p-3 rounded-xl border border-white/10 bg-white/4 text-white text-base font-bold text-center outline-none focus:border-purple-400 transition-colors"
              />
              <span className="text-xs text-white/40 font-semibold shrink-0">
                hours / day
              </span>
            </div>

            <div className="flex gap-2 mb-5">
              {[2, 4, 6, 8].map((h) => {
                const active = draftTarget === String(h);
                return (
                  <button
                    key={h}
                    onClick={() => setDraftTarget(String(h))}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all duration-200 ${
                      active
                        ? "border-purple-500 bg-purple-500/20 text-white"
                        : "border-white/10 bg-transparent text-white/50 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            <button
              onClick={saveTarget}
              className="w-full py-3 rounded-xl border-0 cursor-pointer text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
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