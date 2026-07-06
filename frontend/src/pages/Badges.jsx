// src/pages/Badges.jsx
import { useState, useMemo } from "react";
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
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TEMPORARY: badge definitions + unlock state are hardcoded here.
// SWAP POINT — once the backend exists, fetch each badge's
// unlocked/progress fields from /api/badges instead; the icon,
// name, description, category, and rarity metadata below can stay
// as a static catalog either way, since that part rarely changes.
// ─────────────────────────────────────────────────────────────

const RARITY = {
  common:    { label: "Common",    color: "#9ca3af", glow: "rgba(156,163,175,0.35)" },
  rare:      { label: "Rare",      color: "#38bdf8", glow: "rgba(56,189,248,0.4)" },
  epic:      { label: "Epic",      color: "#a855f7", glow: "rgba(168,85,247,0.45)" },
  legendary: { label: "Legendary", color: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
};

const CATEGORIES = ["All", "Streaks", "Mastery", "Quizzes", "Leaderboard", "Milestones"];

const BADGES = [
  { id: "b1",  category: "Streaks",     rarity: "common",    icon: Flame,   name: "Warming Up",     desc: "Reach a 3-day streak",              unlocked: true,  earned: "Jun 12", progress: 3,  target: 3 },
  { id: "b2",  category: "Streaks",     rarity: "rare",      icon: Flame,   name: "On Fire",        desc: "Reach a 7-day streak",               unlocked: true,  earned: "Jun 16", progress: 7,  target: 7 },
  { id: "b3",  category: "Streaks",     rarity: "epic",      icon: Flame,   name: "Unstoppable",    desc: "Reach a 30-day streak",              unlocked: false, progress: 18, target: 30 },
  { id: "b4",  category: "Streaks",     rarity: "legendary", icon: Crown,   name: "Centurion",      desc: "Reach a 100-day streak",             unlocked: false, progress: 18, target: 100 },

  { id: "b5",  category: "Mastery",     rarity: "common",    icon: BookOpen,name: "First Steps",    desc: "Reach 50% mastery in any subject",   unlocked: true,  earned: "Jun 20" },
  { id: "b6",  category: "Mastery",     rarity: "rare",      icon: Brain,   name: "Subject Expert", desc: "Reach 90% mastery in any subject",   unlocked: false, progress: 78, target: 90 },
  { id: "b7",  category: "Mastery",     rarity: "epic",      icon: Star,    name: "Polymath",       desc: "Reach 80%+ mastery in 3 subjects",   unlocked: false, progress: 1,  target: 3 },
  { id: "b8",  category: "Mastery",     rarity: "legendary", icon: Sparkles,name: "Grandmaster",    desc: "Reach 100% mastery in any subject",  unlocked: false, progress: 78, target: 100 },

  { id: "b9",  category: "Quizzes",     rarity: "common",    icon: Zap,     name: "Quick Draw",     desc: "Complete your first quiz",           unlocked: true,  earned: "Jun 10" },
  { id: "b10", category: "Quizzes",     rarity: "rare",      icon: Target,  name: "Sharp Shooter",  desc: "Score 100% on a quiz",                unlocked: true,  earned: "Jun 28" },
  { id: "b11", category: "Quizzes",     rarity: "epic",      icon: Zap,     name: "Quiz Whiz",      desc: "Complete 50 quizzes",                 unlocked: false, progress: 32, target: 50 },

  { id: "b12", category: "Leaderboard", rarity: "rare",      icon: Trophy,  name: "Top 10 Finish",  desc: "End a week ranked in the top 10",     unlocked: true,  earned: "Jun 23" },
  { id: "b13", category: "Leaderboard", rarity: "epic",      icon: Crown,   name: "League Champion",desc: "Finish #1 in your league",            unlocked: false, progress: 4,  target: 1 },
  { id: "b14", category: "Leaderboard", rarity: "legendary", icon: Crown,   name: "Obsidian Rank",  desc: "Reach the Obsidian league",           unlocked: false, progress: 4,  target: 6 },

  { id: "b15", category: "Milestones",  rarity: "common",    icon: BookOpen,name: "First Note",     desc: "Create your first note",              unlocked: true,  earned: "Jun 8" },
  { id: "b16", category: "Milestones",  rarity: "rare",      icon: Brain,   name: "Card Collector", desc: "Review 100 flashcards",               unlocked: true,  earned: "Jun 25" },
  { id: "b17", category: "Milestones",  rarity: "rare",      icon: Sunrise, name: "Early Bird",     desc: "Study before 7 AM",                   unlocked: false, progress: 0,  target: 1 },
  { id: "b18", category: "Milestones",  rarity: "epic",      icon: Moon,    name: "Night Owl",      desc: "Study after midnight 5 times",        unlocked: false, progress: 2,  target: 5 },
];

function BadgeCard({ badge, index }) {
  const { icon: Icon, name, desc, unlocked, earned, progress, target, rarity } = badge;
  const r = RARITY[rarity];
  const pct = target ? Math.min(100, Math.round((progress / target) * 100)) : 0;

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
      {/* rarity tag */}
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
        <p className="text-[11px] text-white/30 mt-3">Earned {earned}</p>
      ) : target ? (
        <div className="w-full mt-3.5">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: r.color }}
            />
          </div>
          <p className="text-[11px] text-white/35 mt-1.5 tabular-nums">{progress} / {target}</p>
        </div>
      ) : (
        <p className="text-[11px] text-white/25 mt-3">Not started</p>
      )}
    </div>
  );
}

export default function Badges() {
  const [category, setCategory] = useState("All");

  const filtered = useMemo(
    () => (category === "All" ? BADGES : BADGES.filter((b) => b.category === category)),
    [category]
  );

  const unlockedCount = BADGES.filter((b) => b.unlocked).length;
  const rarityCounts = useMemo(() => {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    BADGES.filter((b) => b.unlocked).forEach((b) => counts[b.rarity]++);
    return counts;
  }, []);

  return (
    <div className="relative min-h-screen bg-[#09050e] text-white overflow-x-hidden">
      <style>{`
        @keyframes badgeFadeUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .badge-fade-up { animation: badgeFadeUp 0.35s ease-out both; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[26rem] h-[26rem] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <Award className="w-7 h-7 text-amber-400" />
          Badges
        </h1>
        <p className="text-white/40 mt-1 mb-6">Earned through streaks, mastery, quizzes, and league play.</p>

        {/* stats */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 mb-6 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-2xl font-black">{unlockedCount}<span className="text-white/30 text-lg">/{BADGES.length}</span></p>
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

        {/* category tabs */}
        <div className="inline-flex flex-wrap rounded-xl bg-white/5 border border-white/10 p-1 gap-1 mb-6">
          {CATEGORIES.map((c) => (
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

        {/* grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((b, i) => (
            <BadgeCard key={b.id} badge={b} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}