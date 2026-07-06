// src/pages/Leaderboard.jsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Trophy,
  Flame,
  Crown,
  Medal,
  Users,
  Clock,
  ChevronUp,
  ChevronDown,
  Minus,
  Search,
  Sparkles,
  Info,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TEMPORARY: mock league + leaderboard data, plus a fake "live"
// tick that nudges a few users' XP every few seconds so ranks
// visibly move. SWAP POINT — once the backend/websocket exists,
// replace LEAGUE_TIERS/initialRows with a fetch, and replace the
// setInterval tick with a socket subscription that calls
// setRows(next) the same way. The rendering layer doesn't change.
// ─────────────────────────────────────────────────────────────

const LEAGUE_TIERS = [
  { name: "Bronze",   color: "#b45309", glow: "rgba(180,83,9,0.35)" },
  { name: "Silver",   color: "#94a3b8", glow: "rgba(148,163,184,0.35)" },
  { name: "Gold",     color: "#eab308", glow: "rgba(234,179,8,0.35)" },
  { name: "Platinum", color: "#22d3ee", glow: "rgba(34,211,238,0.35)" },
  { name: "Diamond",  color: "#a855f7", glow: "rgba(168,85,247,0.4)" },
  { name: "Obsidian", color: "#f472b6", glow: "rgba(244,114,182,0.4)" },
];
const CURRENT_LEAGUE_INDEX = 4; // Diamond

const AVATAR_IDS = [12, 5, 8, 15, 22, 33, 44, 51, 60, 3, 9, 18, 27, 36, 45];
const NAMES = [
  "Yatish", "Aarav Mehta", "Priya Nair", "Rohan Gupta", "Sanya Kapoor",
  "Devansh Rao", "Isha Verma", "Kabir Singh", "Meera Iyer", "Vivaan Joshi",
  "Ananya Reddy", "Arjun Malhotra", "Tara Bhatt", "Yash Kulkarni", "Neha Pillai",
];

function makeInitialRows() {
  return NAMES.map((name, i) => ({
    id: `u${i}`,
    name,
    isYou: name === "Yatish",
    avatar: `https://i.pravatar.cc/100?img=${AVATAR_IDS[i]}`,
    streak: Math.floor(Math.random() * 40) + 3,
    weeklyXP: Math.floor(Math.random() * 900) + 300,
    prevRank: null,
  }));
}

function withRanks(rows) {
  const sorted = [...rows].sort((a, b) => b.weeklyXP - a.weeklyXP);
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}

function nextMonday() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  const daysUntil = (8 - day) % 7 || 7;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntil);
  target.setHours(0, 0, 0, 0);
  return target;
}

function useCountdown(target) {
  const [remaining, setRemaining] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const clamped = Math.max(0, remaining);
  const days = Math.floor(clamped / 86400000);
  const hours = Math.floor((clamped % 86400000) / 3600000);
  const mins = Math.floor((clamped % 3600000) / 60000);
  return { days, hours, mins };
}

export default function Leaderboard() {
  const [rows, setRows] = useState(() => withRanks(makeInitialRows()));
  const [scope, setScope] = useState("league"); // league | friends | global
  const [search, setSearch] = useState("");
  const [flashIds, setFlashIds] = useState({});
  const target = useMemo(() => nextMonday(), []);
  const { days, hours, mins } = useCountdown(target);
  const prevRanksRef = useRef({});

  // seed prevRanks once
  useEffect(() => {
    const map = {};
    rows.forEach((r) => (map[r.id] = r.rank));
    prevRanksRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fake "live" tick — nudges a couple of random users' XP, re-sorts,
  // and flashes the rows whose rank changed
  const tick = useCallback(() => {
    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      const nudgeCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < nudgeCount; i++) {
        const idx = Math.floor(Math.random() * next.length);
        next[idx].weeklyXP += Math.floor(Math.random() * 40) + 10;
      }
      const ranked = withRanks(next);

      const changed = {};
      ranked.forEach((r) => {
        const prevRank = prevRanksRef.current[r.id] ?? r.rank;
        if (prevRank !== r.rank) changed[r.id] = true;
        r.prevRank = prevRank;
      });
      prevRanksRef.current = Object.fromEntries(ranked.map((r) => [r.id, r.rank]));

      if (Object.keys(changed).length) {
        setFlashIds(changed);
        setTimeout(() => setFlashIds({}), 1200);
      }
      return ranked;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [tick]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, search]);

  const you = rows.find((r) => r.isYou);
  const league = LEAGUE_TIERS[CURRENT_LEAGUE_INDEX];
  const promoteCount = 3;
  const demoteCount = 3;

  return (
    <div className="relative min-h-screen bg-[#09050e] text-white overflow-x-hidden">
      <style>{`
        @keyframes lbFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lbFlash { 0% { background-color: rgba(168,85,247,0.22); } 100% { background-color: transparent; } }
        @keyframes lbFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .lb-fade-up { animation: lbFadeUp 0.3s ease-out both; }
        .lb-flash { animation: lbFlash 1.1s ease-out; }
        .lb-float { animation: lbFloat 6s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[28rem] h-[28rem] rounded-full blur-[140px]" style={{ background: league.glow }} />
        <div className="absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Trophy className="w-7 h-7 text-purple-400" />
              Leaderboard
            </h1>
            <p className="text-white/40 mt-1">Climb the league, hold your rank, don't get relegated.</p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
            <Clock className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white/60">League resets in</span>
            <span className="text-sm font-semibold text-white tabular-nums">
              {days}d {hours}h {mins}m
            </span>
          </div>
        </div>

        {/* League ladder */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 mb-6 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {LEAGUE_TIERS.map((tier, i) => {
              const active = i === CURRENT_LEAGUE_INDEX;
              return (
                <div key={tier.name} className="flex items-center gap-2">
                  <div
                    className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                      active ? "scale-110" : "opacity-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? "lb-float" : ""}`}
                      style={{
                        background: `${tier.color}22`,
                        border: `1.5px solid ${tier.color}`,
                        boxShadow: active ? `0 0 20px ${tier.glow}` : "none",
                      }}
                    >
                      <Medal className="w-5 h-5" style={{ color: tier.color }} />
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: active ? tier.color : "#ffffff80" }}>
                      {tier.name}
                    </span>
                  </div>
                  {i < LEAGUE_TIERS.length - 1 && (
                    <div className="w-8 h-px bg-white/10 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Your standing */}
        {you && (
          <div
            className="rounded-2xl border p-5 mb-6 flex items-center gap-4 flex-wrap"
            style={{ borderColor: `${league.color}40`, background: `${league.color}0d` }}
          >
            <img src={you.avatar} alt="" className="w-14 h-14 rounded-full border-2" style={{ borderColor: league.color }} />
            <div className="flex-1 min-w-[160px]">
              <p className="text-sm text-white/50">You're currently ranked</p>
              <p className="text-2xl font-black">#{you.rank} <span className="text-base font-medium text-white/50">in {league.name}</span></p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-lg font-bold flex items-center gap-1 justify-center"><Flame className="w-4 h-4 text-orange-400" />{you.streak}</p>
                <p className="text-[11px] text-white/40">day streak</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{you.weeklyXP}</p>
                <p className="text-[11px] text-white/40">weekly XP</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${you.rank <= promoteCount ? "text-emerald-400" : you.rank > rows.length - demoteCount ? "text-red-400" : "text-white/70"}`}>
                  {you.rank <= promoteCount ? "Promotion" : you.rank > rows.length - demoteCount ? "Danger" : "Safe"}
                </p>
                <p className="text-[11px] text-white/40">zone</p>
              </div>
            </div>
          </div>
        )}

        {/* Scope tabs + search */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1 gap-1">
            {[
              { id: "league", label: "This League", icon: Crown },
              { id: "friends", label: "Friends", icon: Users },
              { id: "global", label: "Global", icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setScope(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  scope === id ? "bg-purple-500 text-white" : "text-white/55 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a player"
              className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm outline-none placeholder-white/30 focus:border-purple-400/50 transition-colors w-48"
            />
          </div>
        </div>

        {/* Zone legend */}
        <div className="flex items-center gap-4 text-[11px] text-white/40 mb-3 px-1">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Promotion zone — top {promoteCount}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Demotion zone — bottom {demoteCount}</span>
        </div>

        {/* Rows */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          {filtered.map((r, i) => {
            const inPromo = r.rank <= promoteCount;
            const inDemo = r.rank > rows.length - demoteCount;
            const delta = r.prevRank != null ? r.prevRank - r.rank : 0;

            return (
              <div
                key={r.id}
                style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
                className={`lb-fade-up flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 transition-colors ${
                  r.isYou ? "bg-purple-500/[0.06]" : ""
                } ${flashIds[r.id] ? "lb-flash" : ""}`}
              >
                {/* rank + delta */}
                <div className="w-10 flex flex-col items-center flex-shrink-0">
                  <span
                    className={`text-sm font-bold ${
                      r.rank === 1 ? "text-yellow-400" : r.rank === 2 ? "text-slate-300" : r.rank === 3 ? "text-amber-600" : "text-white/70"
                    }`}
                  >
                    {r.rank}
                  </span>
                  {delta !== 0 ? (
                    <span className={`flex items-center text-[10px] font-semibold ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {delta > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {Math.abs(delta)}
                    </span>
                  ) : (
                    <Minus className="w-3 h-3 text-white/20" />
                  )}
                </div>

                <img src={r.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate flex items-center gap-1.5">
                    {r.name}
                    {r.isYou && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">You</span>}
                  </p>
                  <p className="text-[11px] text-white/35 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> {r.streak}d streak
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold tabular-nums">{r.weeklyXP.toLocaleString()}</p>
                  <p className="text-[11px] text-white/35">XP</p>
                </div>

                {(inPromo || inDemo) && (
                  <span className={`w-1.5 h-8 rounded-full flex-shrink-0 ${inPromo ? "bg-emerald-400/70" : "bg-red-400/70"}`} />
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-white/35 py-10">No players match "{search}"</p>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-white/30 mt-3">
          <Info className="w-3 h-3" /> Ranks update live as XP comes in from focus sessions, quizzes, and flashcard reviews.
        </p>
      </div>
    </div>
  );
}