import { getDashboardGreeting } from "../../utils/DashboardGreeting";
import { useMemo, useState, useEffect } from "react";
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
  Circle,
  BookMarked,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

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

// ── small formatting helpers ──────────────────────────────────
function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function deadlineLabel(iso) {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} Days`;
}

// is "now" within this task's startTime–endTime window today? (used to
// mark the current schedule block as active, like the old mock's `active` flag)
function isActiveNow(task) {
  if (!task.startTime || !task.endTime) return false;
  const now = new Date();
  const [sh, sm] = task.startTime.split(":").map(Number);
  const [eh, em] = task.endTime.split(":").map(Number);
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);
  return now >= start && now <= end;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/dashboard/summary");
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const greeting = useMemo(() => {
    if (!user || !summary) return { title: "", subtitle: "" };
    return getDashboardGreeting({
      name: user.name,
      studyStreak: summary.streak,
    });
  }, [user, summary]);

  // optimistic toggle for Study Plan checklist items, calls the real
  // toggle endpoint and rolls back on failure
  async function toggleTask(taskId) {
    setSummary((prev) => ({
      ...prev,
      studyPlan: prev.studyPlan.map((t) =>
        t._id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    }));
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch (err) {
      console.error("Failed to toggle task:", err);
      setSummary((prev) => ({
        ...prev,
        studyPlan: prev.studyPlan.map((t) =>
          t._id === taskId ? { ...t, completed: !t.completed } : t,
        ),
      }));
    }
  }

  if (loading || !summary) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050308",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 className="animate-spin" size={28} color="#a855f7" />
      </div>
    );
  }

  const doneCount = summary.studyPlan.filter((t) => t.completed).length;
  const taskPct = summary.studyPlan.length
    ? Math.round((doneCount / summary.studyPlan.length) * 100)
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 40% at 80% -5%,rgba(168,85,247,.1),transparent 55%),#050308",
        padding: "28px 32px 60px",
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
          borderRadius: 20,
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
                {summary.streak}-day streak
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
                lineHeight: 1.2,
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
              <Link
                to="/dashboard/focus"
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
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Continue Studying
              </Link>
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
                value: `${summary.studyHours}h`,
                color: "#a855f7",
                icon: <Clock size={14} />,
              },
              {
                label: "Streak",
                value: `${summary.streak}d`,
                color: "#fb923c",
                icon: <Flame size={14} />,
              },
              {
                label: "Today's Progress",
                value: `${summary.todayCompletionPct}%`,
                color: "#22d3ee",
                icon: <TrendingUp size={14} />,
              },
              {
                label: "Due Cards",
                value: `${summary.dueCardsTotal}`,
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

      {/* TEMPORARY — mounting this throws during render, which IS caught
          by the Sentry Error Boundary in main.jsx. Remove once verified. */}
      {forceTestCrash && <BrokenTestComponent />}

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
              {doneCount}/{summary.studyPlan.length} done
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
          {summary.studyPlan.length === 0 && (
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.35)",
                padding: "8px 4px",
              }}
            >
              No checklist items yet — add some from the Planner.
            </p>
          )}
          {summary.studyPlan.map((t) => (
            <div
              key={t._id}
              className="hov-row"
              onClick={() => toggleTask(t._id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                borderRadius: 12,
                marginBottom: 8,
                border: "1px solid rgba(255,255,255,.06)",
                background: t.completed
                  ? "rgba(168,85,247,.04)"
                  : "rgba(255,255,255,.02)",
                transition: "all .15s",
                cursor: "pointer",
              }}
            >
              {t.completed ? (
                <CheckCircle2 size={15} color="#a855f7" />
              ) : (
                <Circle size={15} color="rgba(255,255,255,.2)" />
              )}
              <span
                style={{
                  fontSize: 13.5,
                  flex: 1,
                  color: t.completed
                    ? "rgba(255,255,255,.4)"
                    : "rgba(255,255,255,.85)",
                  textDecoration: t.completed ? "line-through" : "none",
                }}
              >
                {t.title}
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
          {summary.schedule.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
              Nothing scheduled today.
            </p>
          ) : (
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
              {summary.schedule.map((s, i) => {
                const active = !s.completed && isActiveNow(s);
                return (
                  <div
                    key={s._id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      position: "relative",
                      marginBottom: i < summary.schedule.length - 1 ? 14 : 0,
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
                        background: s.completed
                          ? "#a855f7"
                          : active
                            ? "#22d3ee"
                            : "rgba(255,255,255,.15)",
                        boxShadow: active
                          ? "0 0 10px rgba(34,211,238,.8)"
                          : s.completed
                            ? "0 0 6px rgba(168,85,247,.5)"
                            : "none",
                        animation: active
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
                            fontWeight: active ? 700 : 500,
                            color: s.completed
                              ? "rgba(255,255,255,.35)"
                              : active
                                ? "#fff"
                                : "rgba(255,255,255,.75)",
                            textDecoration: s.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {s.title}
                        </span>
                        {active && (
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
                        style={{
                          fontSize: 11.5,
                          color: "rgba(255,255,255,.3)",
                        }}
                      >
                        {s.startTime || ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            <Link
              to="/dashboard/planner"
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
                textDecoration: "none",
              }}
            >
              All <ArrowRight size={11} />
            </Link>
          </div>
          {summary.deadlines.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
              No upcoming deadlines.
            </p>
          )}
          {summary.deadlines.map((d) => (
            <div
              key={d._id}
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
                  {deadlineLabel(d.date)}
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
          {summary.subjects.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
              Create a subject to start tracking mastery.
            </p>
          )}
          {summary.subjects.map((s, i) => (
            <div
              key={s.id}
              style={{ marginBottom: i < summary.subjects.length - 1 ? 16 : 0 }}
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
                  {s.dueCards > 0 && (
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
                      {s.dueCards} due
                    </span>
                  )}
                  <span
                    style={{ fontSize: 13, fontWeight: 800, color: s.color }}
                  >
                    {s.masteryPct}%
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
                    width: `${s.masteryPct}%`,
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
            {summary.heatmap.map((v, i) => {
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
                value: `${summary.streak}d`,
                color: "#fb923c",
              },
              {
                label: "Best Streak",
                value: `${summary.bestStreak}d`,
                color: "#a855f7",
              },
              {
                label: "Weekly XP",
                value: `${summary.weeklyXP}`,
                color: "#34d399",
              },
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
          {summary.activity.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
              Nothing yet — go study something!
            </p>
          )}
          {summary.activity.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  i < summary.activity.length - 1
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
                  {relativeTime(a.time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}