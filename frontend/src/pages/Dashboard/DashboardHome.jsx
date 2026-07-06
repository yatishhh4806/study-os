import { getDashboardGreeting } from "../../utils/DashboardGreeting";
import { useMemo } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Flame,
  Clock,
  Brain,
  Trophy,
  ArrowRight,
  TrendingUp,
  Zap,
  CircleCheck,
  Circle,
  BookMarked,
  LayoutGrid,
} from "lucide-react";
import { Link } from "react-router-dom";

const currentUser = {
  name: "Yatish",
  studyStreak: 18,
  pendingTasks: 6,
  productivity: 87,
  focusScore: 82,
};

const TASKS = [
  { label: "Complete React Dashboard", done: true },
  { label: "Practice DSA Graphs", done: true },
  { label: "Review DBMS Notes", done: false },
  { label: "Study Machine Learning", done: false },
];

const DEADLINES = [
  { title: "SEPM Assignment", date: "Tomorrow", urgency: "high" },
  { title: "ML Project", date: "3 Days", urgency: "medium" },
  { title: "React Project", date: "5 Days", urgency: "low" },
];

const SUBJECTS = [
  { name: "Data Structures", mastery: 78, color: "#a855f7", due: 5 },
  { name: "Machine Learning", mastery: 54, color: "#22d3ee", due: 12 },
  { name: "DBMS", mastery: 91, color: "#34d399", due: 2 },
  { name: "Computer Networks", mastery: 42, color: "#fb923c", due: 9 },
];

const HEATMAP = [
  0, 1, 0, 2, 3, 2, 1, 0, 0, 2, 3, 1, 0, 1, 2, 3, 3, 1, 0, 2, 3, 1, 0, 3, 2, 1,
  2, 3, 1, 2,
];

const ACTIVITY = [
  {
    icon: "🧠",
    text: "Reviewed 12 DSA flashcards",
    time: "2h ago",
    color: "#a855f7",
  },
  {
    icon: "📝",
    text: "Updated Graph Traversal notes",
    time: "4h ago",
    color: "#22d3ee",
  },
  {
    icon: "⏱",
    text: "Completed 2 × 25min focus blocks",
    time: "5h ago",
    color: "#34d399",
  },
  {
    icon: "📄",
    text: "Generated ML flashcards from PDF",
    time: "Yesterday",
    color: "#fb923c",
  },
];

const SCHEDULE = [
  { time: "10:00", label: "DSA Study Block", done: true },
  { time: "12:00", label: "DBMS Revision", done: true },
  { time: "15:00", label: "ML Flashcards Review", done: false, active: true },
  { time: "18:00", label: "React Project Work", done: false },
  { time: "21:00", label: "Evening Focus Session", done: false },
];

const URGENCY = { high: "#f87171", medium: "#fb923c", low: "#34d399" };

const glass = {
  borderRadius: 24,
  border: "1px solid rgba(168,85,247,.15)",
  background: "linear-gradient(180deg,rgba(18,12,26,.85),rgba(8,6,12,.9))",
  backdropFilter: "blur(20px)",
  padding: "26px 28px",
  boxShadow: "0 20px 50px -20px rgba(0,0,0,.5)",
  transition: "border-color .2s",
};

export default function DashboardHome() {
  const greeting = useMemo(() => getDashboardGreeting(currentUser), []);
  const doneCount = TASKS.filter((t) => t.done).length;
  const taskPct = Math.round((doneCount / TASKS.length) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 40% at 80% -5%,rgba(168,85,247,.1),transparent 55%),#050308",
        padding: "44px 32px 60px",
        fontFamily:
          "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        color: "#fff",
      }}
    >
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.15)}}
        .db{animation:fadeUp .35s ease both}
        .db:hover{border-color:rgba(168,85,247,.28)!important}
        .hov-row:hover{background:rgba(168,85,247,.07)!important;border-color:rgba(168,85,247,.2)!important}
        .stat-mini:hover{transform:translateY(-2px);border-color:rgba(168,85,247,.3)!important}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(168,85,247,.3);border-radius:99px}
      `}</style>

      {/* — ROW 1: GREETING — */}
      <div
        className="db"
        style={{
          ...glass,
          border: "1px solid rgba(168,85,247,.2)",
          padding: "32px 36px",
          marginBottom: 18,
          boxShadow:
            "0 0 1px rgba(255,255,255,.02),0 30px 60px -20px rgba(0,0,0,.6),0 0 80px -30px rgba(168,85,247,.25)",
          position: "relative",
          borderRadius: 20, // match whatever your `glass` token already uses here
        }}
      >
        {/* decorative blob — clipped to its OWN box, not the whole card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: "inherit",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -80,
              top: -80,
              width: 360,
              height: 360,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(168,85,247,.1),transparent 70%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Flame size={14} color="#fb923c" />
              <span
                style={{ fontSize: 12.5, fontWeight: 700, color: "#fb923c" }}
              >
                {currentUser.studyStreak}-day streak
              </span>
              <span
                style={{
                  width: 1,
                  height: 12,
                  background: "rgba(255,255,255,.12)",
                  margin: "0 6px",
                }}
              />
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.35)" }}>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: -1.5,
                margin: 0,
                lineHeight: 1.15,
                background: "linear-gradient(135deg,#fff 40%,#c4b5fd)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              {greeting.title}
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,.45)",
                marginTop: 8,
                lineHeight: 1.7,
                maxWidth: 540,
              }}
            >
              {greeting.subtitle}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button
                style={{
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg,#a855f7,#a855f7bb)",
                  boxShadow: "0 8px 24px -6px rgba(168,85,247,.5)",
                }}
              >
                Continue Studying
              </button>
              <Link
                to="/dashboard/planner"
                style={{
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.04)",
                  color: "rgba(255,255,255,.7)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View Planner
              </Link>
            </div>
          </div>

          {/* 4 stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              minWidth: 260,
            }}
          >
            {[
              {
                label: "Study Hours",
                value: "24.5h",
                color: "#a855f7",
                icon: <Clock size={14} />,
              },
              {
                label: "Streak",
                value: `${currentUser.studyStreak}d`,
                color: "#fb923c",
                icon: <Flame size={14} />,
              },
              {
                label: "Productivity",
                value: `${currentUser.productivity}%`,
                color: "#22d3ee",
                icon: <TrendingUp size={14} />,
              },
              {
                label: "Due Cards",
                value: `${SUBJECTS.reduce((s, x) => s + x.due, 0)}`,
                color: "#f472b6",
                icon: <Brain size={14} />,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="stat-mini"
                style={{
                  padding: "13px 14px",
                  borderRadius: 14,
                  border: `1px solid ${s.color}22`,
                  background: `${s.color}0d`,
                  transition: "all .2s",
                  cursor: "default",
                }}
              >
                <div style={{ color: s.color, marginBottom: 5 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.38)",
                    marginTop: 1,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 2: PLAN + SCHEDULE + DEADLINES ──────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 18,
          marginBottom: 18,
        }}
      >
        {/* Study Plan */}
        <div className="db" style={{ ...glass, animationDelay: ".05s" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={15} color="#a855f7" />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                Study Plan
              </h2>
            </div>
            <span style={{ fontSize: 12, color: "#a855f7", fontWeight: 700 }}>
              {doneCount}/{TASKS.length} done
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: "rgba(255,255,255,.07)",
              marginBottom: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${taskPct}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg,#a855f7,#22d3ee)",
                boxShadow: "0 0 8px rgba(168,85,247,.5)",
                transition: "width .6s",
              }}
            />
          </div>
          {TASKS.map((t, i) => (
            <div
              key={i}
              className="hov-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                borderRadius: 12,
                marginBottom: 8,
                border: "1px solid rgba(255,255,255,.06)",
                background: t.done
                  ? "rgba(168,85,247,.04)"
                  : "rgba(255,255,255,.02)",
                transition: "all .15s",
                cursor: "pointer",
              }}
            >
              {t.done ? (
                <CheckCircle2 size={15} color="#a855f7" />
              ) : (
                <Circle size={15} color="rgba(255,255,255,.2)" />
              )}
              <span
                style={{
                  fontSize: 13.5,
                  flex: 1,
                  color: t.done
                    ? "rgba(255,255,255,.4)"
                    : "rgba(255,255,255,.85)",
                  textDecoration: t.done ? "line-through" : "none",
                }}
              >
                {t.label}
              </span>
            </div>
          ))}
        </div>

        {/* Today's Schedule */}
        <div className="db" style={{ ...glass, animationDelay: ".08s" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <Calendar size={15} color="#a855f7" />
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
              Today's Schedule
            </h2>
          </div>
          <div style={{ position: "relative", paddingLeft: 18 }}>
            <div
              style={{
                position: "absolute",
                left: 6,
                top: 6,
                bottom: 6,
                width: 1.5,
                background: "rgba(168,85,247,.2)",
                borderRadius: 999,
              }}
            />
            {SCHEDULE.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  position: "relative",
                  marginBottom: i < SCHEDULE.length - 1 ? 14 : 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: -22,
                    top: 4,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: s.done
                      ? "#a855f7"
                      : s.active
                        ? "#22d3ee"
                        : "rgba(255,255,255,.15)",
                    boxShadow: s.active
                      ? "0 0 10px rgba(34,211,238,.8)"
                      : s.done
                        ? "0 0 6px rgba(168,85,247,.5)"
                        : "none",
                    animation: s.active
                      ? "pulse 2s ease-in-out infinite"
                      : "none",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: s.active ? 700 : 500,
                        color: s.done
                          ? "rgba(255,255,255,.35)"
                          : s.active
                            ? "#fff"
                            : "rgba(255,255,255,.75)",
                        textDecoration: s.done ? "line-through" : "none",
                      }}
                    >
                      {s.label}
                    </span>
                    {s.active && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: "rgba(34,211,238,.15)",
                          color: "#22d3ee",
                        }}
                      >
                        NOW
                      </span>
                    )}
                  </div>
                  <span
                    style={{ fontSize: 11.5, color: "rgba(255,255,255,.3)" }}
                  >
                    {s.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div className="db" style={{ ...glass, animationDelay: ".11s" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={15} color="#a855f7" />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                Deadlines
              </h2>
            </div>
            <button
              style={{
                fontSize: 12,
                color: "#a855f7",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 700,
              }}
            >
              All <ArrowRight size={11} />
            </button>
          </div>
          {DEADLINES.map((d, i) => (
            <div
              key={i}
              className="hov-row"
              style={{
                padding: "13px 15px",
                borderRadius: 14,
                marginBottom: 10,
                border: "1px solid rgba(255,255,255,.06)",
                background: "rgba(255,255,255,.02)",
                transition: "all .15s",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: URGENCY[d.urgency],
                    boxShadow: `0 0 6px ${URGENCY[d.urgency]}`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "#fff",
                    flex: 1,
                  }}
                >
                  {d.title}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: URGENCY[d.urgency],
                    background: `${URGENCY[d.urgency]}15`,
                    padding: "3px 9px",
                    borderRadius: 7,
                  }}
                >
                  {d.date}
                </span>
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,.05)",
            }}
          >
            {[
              ["high", "Urgent"],
              ["medium", "Soon"],
              ["low", "Relaxed"],
            ].map(([u, l]) => (
              <div
                key={u}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: URGENCY[u],
                  }}
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: MASTERY + HEATMAP + ACTIVITY ─────────────── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}
      >
        {/* Subject Mastery */}
        <div className="db" style={{ ...glass, animationDelay: ".14s" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookMarked size={15} color="#a855f7" />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                Subject Mastery
              </h2>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
              via flashcards
            </span>
          </div>
          {SUBJECTS.map((s, i) => (
            <div
              key={i}
              style={{ marginBottom: i < SUBJECTS.length - 1 ? 16 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 7,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: s.color,
                      boxShadow: `0 0 5px ${s.color}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,.8)",
                    }}
                  >
                    {s.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {s.due > 0 && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "#fb923c",
                        background: "rgba(251,146,60,.12)",
                        padding: "2px 7px",
                        borderRadius: 6,
                      }}
                    >
                      {s.due} due
                    </span>
                  )}
                  <span
                    style={{ fontSize: 13, fontWeight: 800, color: s.color }}
                  >
                    {s.mastery}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${s.mastery}%`,
                    borderRadius: 999,
                    background: `linear-gradient(90deg,${s.color},${s.color}88)`,
                    boxShadow: `0 0 8px ${s.color}55`,
                    transition: "width .8s cubic-bezier(.4,0,.2,1)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Study Heatmap */}
        <div className="db" style={{ ...glass, animationDelay: ".17s" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LayoutGrid size={15} color="#a855f7" />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                Study Heatmap
              </h2>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
              Last 30 days
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(10,1fr)",
              gap: 5,
              marginBottom: 12,
            }}
          >
            {HEATMAP.map((v, i) => {
              const bg = [
                "rgba(255,255,255,.06)",
                "rgba(168,85,247,.25)",
                "rgba(168,85,247,.55)",
                "rgba(168,85,247,.9)",
              ][v];
              const glow = [
                "none",
                "none",
                "0 0 5px rgba(168,85,247,.35)",
                "0 0 9px rgba(168,85,247,.65)",
              ][v];
              return (
                <div
                  key={i}
                  title={v === 0 ? "No activity" : `Level ${v}`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 4,
                    background: bg,
                    boxShadow: glow,
                    cursor: "default",
                    transition: "transform .1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.35)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.3)" }}>
              Less
            </span>
            {[
              "rgba(255,255,255,.06)",
              "rgba(168,85,247,.25)",
              "rgba(168,85,247,.55)",
              "rgba(168,85,247,.9)",
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: c,
                }}
              />
            ))}
            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.3)" }}>
              More
            </span>
          </div>
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,.05)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {[
              {
                label: "Current Streak",
                value: `${currentUser.studyStreak}d`,
                color: "#fb923c",
              },
              { label: "Best Streak", value: "24d", color: "#a855f7" },
              { label: "This Month", value: "22d", color: "#34d399" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "rgba(255,255,255,.35)",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="db" style={{ ...glass, animationDelay: ".2s" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Zap size={15} color="#a855f7" />
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
              Recent Activity
            </h2>
          </div>
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  i < ACTIVITY.length - 1
                    ? "1px solid rgba(255,255,255,.05)"
                    : "none",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: `${a.color}12`,
                  border: `1px solid ${a.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,.8)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {a.text}
                </p>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.3)" }}>
                  {a.time}
                </span>
              </div>
            </div>
          ))}
          <button
            style={{
              width: "100%",
              marginTop: 14,
              padding: "10px",
              borderRadius: 12,
              border: "1px solid rgba(168,85,247,.2)",
              background: "rgba(168,85,247,.07)",
              color: "#a855f7",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            View All <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
