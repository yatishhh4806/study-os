// src/utils/badgeCatalog.js

// NOTE on scope: the frontend's Badges.jsx mock also shows "Mastery" and
// "Quizzes" category badges (Subject Expert, Polymath, Quiz Whiz, etc).
// Those aren't included here because there's no real backend concept yet
// of "subject mastery %" or "quiz score" — building fake numbers for them
// would be worse than leaving them out. Once a Quiz/mastery-aggregation
// module exists, add badge definitions for those categories the same way
// the ones below are structured.

export const BADGE_CATALOG = [
  // ── Streaks — based on bestStreak, so a badge stays earned even if
  // the current streak later resets to 0 ──
  {
    id: "warming-up",
    category: "Streaks",
    rarity: "common",
    name: "Warming Up",
    desc: "Reach a 3-day streak",
    target: 3,
    getProgress: (ctx) => ctx.bestStreak,
  },
  {
    id: "on-fire",
    category: "Streaks",
    rarity: "rare",
    name: "On Fire",
    desc: "Reach a 7-day streak",
    target: 7,
    getProgress: (ctx) => ctx.bestStreak,
  },
  {
    id: "unstoppable",
    category: "Streaks",
    rarity: "epic",
    name: "Unstoppable",
    desc: "Reach a 30-day streak",
    target: 30,
    getProgress: (ctx) => ctx.bestStreak,
  },
  {
    id: "centurion",
    category: "Streaks",
    rarity: "legendary",
    name: "Centurion",
    desc: "Reach a 100-day streak",
    target: 100,
    getProgress: (ctx) => ctx.bestStreak,
  },

  // ── Leaderboard — based on historical counters that persist across
  // weekly XP resets (see User.stats + weeklyLeagueReset.js) ──
  {
    id: "top-10-finish",
    category: "Leaderboard",
    rarity: "rare",
    name: "Top 10 Finish",
    desc: "End a week ranked in the global top 10",
    target: 1,
    getProgress: (ctx) => ctx.topTenFinishes,
  },
  {
    id: "league-champion",
    category: "Leaderboard",
    rarity: "epic",
    name: "League Champion",
    desc: "Finish #1 globally at a weekly reset",
    target: 1,
    getProgress: (ctx) => ctx.leagueChampionWins,
  },
  {
    id: "obsidian-rank",
    category: "Leaderboard",
    rarity: "legendary",
    name: "Obsidian Rank",
    desc: "Reach the Obsidian league",
    target: 1,
    getProgress: (ctx) => (ctx.highestLeagueReachedIndex >= 5 ? 1 : 0),
  },

  // ── Milestones — based on real activity data from Notes/Flashcards/FocusSessions ──
  {
    id: "first-note",
    category: "Milestones",
    rarity: "common",
    name: "First Note",
    desc: "Create your first note",
    target: 1,
    getProgress: (ctx) => Math.min(ctx.noteCount, 1),
  },
  {
    id: "card-collector",
    category: "Milestones",
    rarity: "rare",
    name: "Card Collector",
    desc: "Review 100 flashcards",
    target: 100,
    getProgress: (ctx) => ctx.totalFlashcardReviews,
  },
  {
    id: "early-bird",
    category: "Milestones",
    rarity: "rare",
    name: "Early Bird",
    desc: "Complete a focus session before 7 AM",
    target: 1,
    getProgress: (ctx) => Math.min(ctx.earlyBirdSessions, 1),
  },
  {
    id: "night-owl",
    category: "Milestones",
    rarity: "epic",
    name: "Night Owl",
    desc: "Complete a focus session after midnight, 5 times",
    target: 5,
    getProgress: (ctx) => ctx.nightOwlSessions,
  },
];