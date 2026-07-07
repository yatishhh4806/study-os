// src/utils/streak.js

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(lastDate, today) {
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return isSameDay(lastDate, y);
}

/**
 * Given a user's current streak state and the date of a NEW qualifying
 * study activity (a completed focus session), returns the updated
 * streak numbers. Pure function — no DB access — so the three cases
 * (first ever session, consecutive day, gap/missed day) can be reasoned
 * about and tested without touching Mongo.
 *
 * @param {object} stats - current User.stats subdocument values
 * @param {number} stats.currentStreak
 * @param {number} stats.bestStreak
 * @param {Date|null} stats.lastStudyDate
 * @param {Date} activityDate - when the new qualifying session happened (usually "now")
 */
export function computeStreakUpdate(stats, activityDate = new Date()) {
  const { currentStreak, bestStreak, lastStudyDate } = stats;

  // already logged activity today — streak doesn't change, this session
  // just adds to today's total separately (study minutes, not streak count)
  if (lastStudyDate && isSameDay(new Date(lastStudyDate), activityDate)) {
    return { currentStreak, bestStreak, lastStudyDate: activityDate, streakChanged: false };
  }

  let nextStreak;
  if (!lastStudyDate) {
    nextStreak = 1; // very first session ever
  } else if (isYesterday(new Date(lastStudyDate), activityDate)) {
    nextStreak = currentStreak + 1; // consecutive day
  } else {
    nextStreak = 1; // missed one or more days — streak resets, doesn't go to 0
  }

  return {
    currentStreak: nextStreak,
    bestStreak: Math.max(bestStreak, nextStreak),
    lastStudyDate: activityDate,
    streakChanged: true,
  };
}

/**
 * Lazily checks whether a stored streak is now stale (i.e. more than a day
 * has passed with no qualifying activity) and returns a corrected value if
 * so. This is the mechanism that actually resets a broken streak to 0 —
 * since there's no cron/background worker running yet, correctness is
 * enforced here instead: on every request that loads the user (see
 * middleware/auth.js), not on a schedule. Cheap no-op if the streak is
 * still valid, and easy to swap for a real daily cron job later without
 * changing this function's contract.
 *
 * @returns {{ currentStreak: number, needsUpdate: boolean }}
 */
export function checkStreakStillValid(stats, now = new Date()) {
  if (!stats.lastStudyDate || stats.currentStreak === 0) {
    return { currentStreak: stats.currentStreak, needsUpdate: false };
  }

  const last = new Date(stats.lastStudyDate);
  if (isSameDay(last, now) || isYesterday(last, now)) {
    return { currentStreak: stats.currentStreak, needsUpdate: false }; // still valid
  }

  // more than one full day has passed since the last qualifying session —
  // the streak is broken
  return { currentStreak: 0, needsUpdate: true };
}