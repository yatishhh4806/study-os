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
import { api } from "../lib/api";

const LEAGUE_TIERS = [
  { name: "Bronze",   color: "#b45309", glow: "rgba(180,83,9,0.35)" },
  { name: "Silver",   color: "#94a3b8", glow: "rgba(148,163,184,0.35)" },
  { name: "Gold",     color: "#eab308", glow: "rgba(234,179,8,0.35)" },
  { name: "Platinum", color: "#22d3ee", glow: "rgba(34,211,238,0.35)" },
  { name: "Diamond",  color: "#a855f7", glow: "rgba(168,85,247,0.4)" },
  { name: "Obsidian", color: "#f472b6", glow: "rgba(244,114,182,0.4)" },
];

// mirrors PROMOTE_COUNT/DEMOTE_COUNT in the backend's utils/leagues.js —
// keep these two in sync if that ever changes
const PROMOTE_COUNT = 3;
const DEMOTE_COUNT = 3;

function nextMonday() {
  const now = new Date();
  const day = now.getDay();
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

function initialsAvatar(name) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials;
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [leagueName, setLeagueName] = useState("bronze");
  const [scope, setScope] = useState("league"); // league | global ("friends" disabled — see tabs below)
  const [search, setSearch] = useState("");
  const [flashIds, setFlashIds] = useState({});
  const [loading, setLoading] = useState(true);
  const target = useMemo(() => nextMonday(), []);
  const { days, hours, mins } = useCountdown(target);
  const prevRanksRef = useRef({});

  const loadLeaderboard = useCallback(async () => {
    try {
      const { data } = await api.get("/leaderboard", { params: { scope } });
      setLeagueName(data.league);

      const withDeltas = data.leaderboard.map((r) => {
        const prevRank = prevRanksRef.current[r.userId] ?? r.rank;
        return { ...r, prevRank };
      });

      const changed = {};
      withDeltas.forEach((r) => {
        if (r.prevRank !== r.rank) changed[r.userId] = true;
      });
      prevRanksRef.current = Object.fromEntries(withDeltas.map((r) => [r.userId, r.rank]));

      if (Object.keys(changed).length) {
        setFlashIds(changed);
        setTimeout(() => setFlashIds({}), 1200);
      }

      setRows(withDeltas);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  // initial load + reload whenever scope changes
  useEffect(() => {
    prevRanksRef.current = {}; // reset delta tracking on scope switch
    setLoading(true);
    loadLeaderboard();
  }, [loadLeaderboard]);

  // real periodic refresh — no more fake simulated XP ticks; this just
  // catches genuine changes (your own reviews/sessions, or other real
  // users' activity) since the last poll
  useEffect(() => {
    const id = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(id);
  }, [loadLeaderboard]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, search]);

  const you = rows.find((r) => r.isYou);
  const leagueIndex = LEAGUE_TIERS.findIndex((t) => t.name.toLowerCase() === leagueName);
  const league = LEAGUE_TIERS[leagueIndex] ?? LEAGUE_TIERS[0];

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

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 mb-6 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {LEAGUE_TIERS.map((tier, i) => {
              const active = i === leagueIndex;
              return (
                <div key={tier.name} className="flex items-center gap-2">
                  <div className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${active ? "scale-110" : "opacity-50"}`}>
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
                  {i < LEAGUE_TIERS.length - 1 && <div className="w-8 h-px bg-white/10 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {you && (
          <div
            className="rounded-2xl border p-5 mb-6 flex items-center gap-4 flex-wrap"
            style={{ borderColor: `${league.color}40`, background: `${league.color}0d` }}
          >
            <div
              className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ borderColor: league.color, background: `${league.color}22` }}
            >
              {you.avatarUrl ? (
                <img src={you.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                initialsAvatar(you.name)
              )}
            </div>
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
                <p className={`text-lg font-bold ${you.rank <= PROMOTE_COUNT ? "text-emerald-400" : you.rank > rows.length - DEMOTE_COUNT ? "text-red-400" : "text-white/70"}`}>
                  {you.rank <= PROMOTE_COUNT ? "Promotion" : you.rank > rows.length - DEMOTE_COUNT ? "Danger" : "Safe"}
                </p>
                <p className="text-[11px] text-white/40">zone</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1 gap-1">
            {[
              { id: "league", label: "This League", icon: Crown, disabled: false },
              { id: "friends", label: "Friends", icon: Users, disabled: true },
              { id: "global", label: "Global", icon: Sparkles, disabled: false },
            ].map(({ id, label, icon: Icon, disabled }) => (
              <button
                key={id}
                onClick={() => !disabled && setScope(id)}
                disabled={disabled}
                title={disabled ? "Friend lists aren't built yet" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  disabled
                    ? "text-white/25 cursor-not-allowed"
                    : scope === id
                    ? "bg-purple-500 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/5"
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

        <div className="flex items-center gap-4 text-[11px] text-white/40 mb-3 px-1">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Promotion zone — top {PROMOTE_COUNT}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Demotion zone — bottom {DEMOTE_COUNT}</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          {loading && <p className="text-center text-sm text-white/35 py-10">Loading…</p>}

          {!loading && filtered.map((r, i) => {
            const inPromo = r.rank <= PROMOTE_COUNT;
            const inDemo = r.rank > rows.length - DEMOTE_COUNT;
            const delta = r.prevRank != null ? r.prevRank - r.rank : 0;

            return (
              <div
                key={r.userId}
                style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
                className={`lb-fade-up flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 transition-colors ${
                  r.isYou ? "bg-purple-500/[0.06]" : ""
                } ${flashIds[r.userId] ? "lb-flash" : ""}`}
              >
                <div className="w-10 flex flex-col items-center flex-shrink-0">
                  <span className={`text-sm font-bold ${
                    r.rank === 1 ? "text-yellow-400" : r.rank === 2 ? "text-slate-300" : r.rank === 3 ? "text-amber-600" : "text-white/70"
                  }`}>
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

                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white/10">
                  {r.avatarUrl ? (
                    <img src={r.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initialsAvatar(r.name)
                  )}
                </div>

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

          {!loading && filtered.length === 0 && (
            <p className="text-center text-sm text-white/35 py-10">
              {search ? `No players match "${search}"` : "No one's ranked here yet — invite some classmates!"}
            </p>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-white/30 mt-3">
          <Info className="w-3 h-3" /> Ranks update from real activity — focus sessions and flashcard reviews. Refreshes every 30s.
        </p>
      </div>
    </div>
  );
}