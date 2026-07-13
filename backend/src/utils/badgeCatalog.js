// src/utils/badgeCatalog.js

// NOTE on scope: Quizzes aren't included as a category — there's no real
// scored-quiz feature built yet (AI Tutor can generate practice questions
// conversationally, but that's not tracked/scored anywhere), and building
// fake progress numbers for it would be worse than leaving it out. Add a
// "Quizzes" section here the same way the others are structured once a
// real quiz/assessment module exists.

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

  // ── Mastery — uses the same "mature card" ratio per subject that
  // powers the dashboard's Subject Mastery widget (a card that's
  // survived 3+ spaced-repetition reviews counts as "mature") ──
  {
    id: "first-steps",
    category: "Mastery",
    rarity: "common",
    name: "First Steps",
    desc: "Reach 50% mastery in any subject",
    target: 50,
    getProgress: (ctx) => ctx.maxMasteryPct,
  },
  {
    id: "subject-expert",
    category: "Mastery",
    rarity: "rare",
    name: "Subject Expert",
    desc: "Reach 90% mastery in any subject",
    target: 90,
    getProgress: (ctx) => ctx.maxMasteryPct,
  },
  {
    id: "polymath",
    category: "Mastery",
    rarity: "epic",
    name: "Polymath",
    desc: "Reach 80%+ mastery in 3 subjects",
    target: 3,
    getProgress: (ctx) => ctx.subjectsAt80Plus,
  },
  {
    id: "grandmaster",
    category: "Mastery",
    rarity: "legendary",
    name: "Grandmaster",
    desc: "Reach 100% mastery in any subject",
    target: 100,
    getProgress: (ctx) => ctx.maxMasteryPct,
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

  // ── Milestones — real activity data from Notes/Flashcards/FocusSessions,
  // with multiple difficulty tiers per activity (Duolingo-style
  // progression) instead of just one badge per feature ──
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
    id: "prolific-writer",
    category: "Milestones",
    rarity: "rare",
    name: "Prolific Writer",
    desc: "Create 10 notes",
    target: 10,
    getProgress: (ctx) => ctx.noteCount,
  },
  {
    id: "note-taking-pro",
    category: "Milestones",
    rarity: "epic",
    name: "Note-Taking Pro",
    desc: "Create 50 notes",
    target: 50,
    getProgress: (ctx) => ctx.noteCount,
  },

  {
    id: "getting-started",
    category: "Milestones",
    rarity: "common",
    name: "Getting Started",
    desc: "Review 10 flashcards",
    target: 10,
    getProgress: (ctx) => ctx.totalFlashcardReviews,
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
    id: "card-master",
    category: "Milestones",
    rarity: "epic",
    name: "Card Master",
    desc: "Review 500 flashcards",
    target: 500,
    getProgress: (ctx) => ctx.totalFlashcardReviews,
  },

  {
    id: "first-focus",
    category: "Milestones",
    rarity: "common",
    name: "First Focus",
    desc: "Complete your first focus session",
    target: 1,
    getProgress: (ctx) => Math.min(ctx.completedFocusSessions, 1),
  },
  {
    id: "four-hours-logged",
    category: "Milestones",
    rarity: "rare",
    name: "4 Hours Logged",
    desc: "Log 4 hours of total study time",
    target: 240,
    getProgress: (ctx) => ctx.totalStudyMinutes,
  },
  {
    id: "twenty-hours-logged",
    category: "Milestones",
    rarity: "epic",
    name: "20 Hours Logged",
    desc: "Log 20 hours of total study time",
    target: 1200,
    getProgress: (ctx) => ctx.totalStudyMinutes,
  },
  {
    id: "hundred-hours-logged",
    category: "Milestones",
    rarity: "legendary",
    name: "100 Hours Logged",
    desc: "Log 100 hours of total study time",
    target: 6000,
    getProgress: (ctx) => ctx.totalStudyMinutes,
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