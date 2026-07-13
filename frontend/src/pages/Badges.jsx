// src/pages/Badges.jsx
import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Flame,
  Brain,
  BookOpen,
  Trophy,
  Crown,
  Zap,
  Moon,
  Sunrise,
  Target,
  Star,
  Lock,
  Sparkles,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { api } from "../lib/api";

const RARITY = {
  common:    { label: "Common",    color: "#9ca3af", glow: "rgba(156,163,175,0.35)" },
  rare:      { label: "Rare",      color: "#38bdf8", glow: "rgba(56,189,248,0.4)" },
  epic:      { label: "Epic",      color: "#a855f7", glow: "rgba(168,85,247,0.45)" },
  legendary: { label: "Legendary", color: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
};

// Icons are a purely visual, frontend-only concern — the backend catalog
// only needs to know progress logic, not how each badge is drawn. Keyed
// by the real badge id from utils/badgeCatalog.js.
const ICON_MAP = {
  "warming-up": Flame,
  "on-fire": Flame,
  "unstoppable": Flame,
  "centurion": Crown,
  "first-steps": BookOpen,
  "subject-expert": Brain,
  "polymath": Star,
  "grandmaster": Sparkles,
  "top-10-finish": Trophy,
  "league-champion": Crown,
  "obsidian-rank": Crown,
  "first-note": BookOpen,
  "prolific-writer": BookOpen,
  "note-taking-pro": BookOpen,
  "getting-started": Zap,
  "card-collector": Brain,
  "card-master": Brain,
  "first-focus": Zap,
  "four-hours-logged": Clock,
  "twenty-hours-logged": Clock,
  "hundred-hours-logged": Clock,
  "early-bird": Sunrise,
  "night-owl": Moon,
};

function BadgeCard({ badge, index }) {
  const Icon = ICON_MAP[badge.id] || Target;
  const { name, desc, unlocked, unlockedAt, progress, target, rarity } = badge;
  const r = RARITY[rarity];
  const pct = target ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const earnedLabel = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div
      style={{
        animationDelay: `${Math.min(index, 12) * 30}ms`,
        borderColor: unlocked ? `${r.color}55` : "rgba(255,255,255,0.08)",
        boxShadow: unlocked ? `0 0 30px -8px ${r.glow}` : "none",
      }}
      className={`badge-fade-up relative rounded-2xl border p-5 flex flex-col items-center text-center transition-transform hover:-translate-y-1 ${
        unlocked ? "bg-white/[0.04]" : "bg-white/[0.02]"
      }`}
    >
      <span
        className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
        style={{ color: r.color, background: `${r.color}1a`, border: `1px solid ${r.color}40` }}
      >
        {r.label}
      </span>

      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${!unlocked ? "grayscale opacity-40" : ""}`}
        style={{
          background: unlocked ? `${r.color}1f` : "rgba(255,255,255,0.05)",
          border: `1.5px solid ${unlocked ? r.color : "rgba(255,255,255,0.12)"}`,
        }}
      >
        {unlocked ? <Icon className="w-7 h-7" style={{ color: r.color }} /> : <Lock className="w-6 h-6 text-white/30" />}
      </div>

      <p className={`text-sm font-semibold ${unlocked ? "text-white" : "text-white/50"}`}>{name}</p>
      <p className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>

      {unlocked ? (
        <p className="text-[11px] text-white/30 mt-3">
          {earnedLabel ? `Earned ${earnedLabel}` : "Earned"}
        </p>
      ) : (
        <div className="w-full mt-3.5">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: r.color }}
            />
          </div>
          <p className="text-[11px] text-white/35 mt-1.5 tabular-nums">{progress} / {target}</p>
        </div>
      )}
    </div>
  );
}

export default function Badges() {
  const [category, setCategory] = useState("All");
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockedToasts, setUnlockedToasts] = useState([]); // badges to celebrate on load

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await api.get("/badges");
        if (cancelled) return;
        setBadges(data.badges);

        if (data.newlyUnlocked?.length) {
          const justUnlocked = data.badges.filter((b) => data.newlyUnlocked.includes(b.id));
          setUnlockedToasts(justUnlocked);
        }
      } catch (err) {
        console.error("Failed to load badges:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(badges.map((b) => b.category))];
    return ["All", ...unique];
  }, [badges]);

  const filtered = useMemo(
    () => (category === "All" ? badges : badges.filter((b) => b.category === category)),
    [category, badges]
  );

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const rarityCounts = useMemo(() => {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    badges.filter((b) => b.unlocked).forEach((b) => counts[b.rarity]++);
    return counts;
  }, [badges]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09050e]">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09050e] text-white overflow-x-hidden">
      <style>{`
        @keyframes badgeFadeUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .badge-fade-up { animation: badgeFadeUp 0.35s ease-out both; }
        .toast-slide-in { animation: toastSlideIn 0.3s ease-out both; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[26rem] h-[26rem] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      {/* Unlock celebration toasts */}
      {unlockedToasts.length > 0 && (
        <div className="fixed top-6 right-6 z-[1200] flex flex-col gap-2.5 w-80">
          {unlockedToasts.map((b) => {
            const Icon = ICON_MAP[b.id] || Target;
            const r = RARITY[b.rarity];
            return (
              <div
                key={b.id}
                className="toast-slide-in flex items-center gap-3 rounded-2xl border p-4 bg-[#15111c] shadow-2xl shadow-black/60"
                style={{ borderColor: `${r.color}55` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${r.color}1f`, border: `1.5px solid ${r.color}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50">Badge unlocked!</p>
                  <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                </div>
                <button
                  onClick={() => setUnlockedToasts((prev) => prev.filter((x) => x.id !== b.id))}
                  className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <Award className="w-7 h-7 text-amber-400" />
          Badges
        </h1>
        <p className="text-white/40 mt-1 mb-6">Earned through streaks, mastery, and study milestones.</p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 mb-6 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-2xl font-black">{unlockedCount}<span className="text-white/30 text-lg">/{badges.length}</span></p>
            <p className="text-xs text-white/40">Badges unlocked</p>
          </div>
          <div className="h-10 w-px bg-white/10 hidden sm:block" />
          {Object.entries(rarityCounts).map(([key, count]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: RARITY[key].color }} />
              <span className="text-sm text-white/60">{count} {RARITY[key].label}</span>
            </div>
          ))}
        </div>

        <div className="inline-flex flex-wrap rounded-xl bg-white/5 border border-white/10 p-1 gap-1 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-lg text-sm transition-colors ${
                category === c ? "bg-purple-500 text-white" : "text-white/55 hover:text-white hover:bg-white/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((b, i) => (
            <BadgeCard key={b.id} badge={b} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}