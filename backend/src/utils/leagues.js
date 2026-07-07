// src/utils/leagues.js

// order matters — index 0 is the lowest tier, last is the highest.
// Kept in sync with the frontend's LEAGUE_TIERS in Leaderboard.jsx.
export const LEAGUE_ORDER = ["bronze", "silver", "gold", "platinum", "diamond", "obsidian"];

export const PROMOTE_COUNT = 3; // top N in a league move up at weekly reset
export const DEMOTE_COUNT = 3; // bottom N move down (never below Bronze)

export function nextLeagueUp(current) {
  const i = LEAGUE_ORDER.indexOf(current);
  return LEAGUE_ORDER[Math.min(i + 1, LEAGUE_ORDER.length - 1)];
}

export function nextLeagueDown(current) {
  const i = LEAGUE_ORDER.indexOf(current);
  return LEAGUE_ORDER[Math.max(i - 1, 0)];
}