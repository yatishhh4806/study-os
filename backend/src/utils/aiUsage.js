// src/utils/aiUsage.js

// tune these based on real Anthropic API cost once you have usage data —
// these are reasonable starting points, not derived from a cost model yet
export const DAILY_LIMITS = {
  free: 15,
  pro: 150,
};

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Checks whether a user can send another AI Tutor message today, lazily
 * resetting their daily counter if it's a new day since their last reset —
 * same self-healing pattern as the streak check in utils/streak.js, so no
 * separate midnight cron job is needed just for this.
 *
 * @returns {{ allowed: boolean, remaining: number, limit: number, needsReset: boolean }}
 */
export function checkAiUsage(user, now = new Date()) {
  const limit = user.isPro() ? DAILY_LIMITS.pro : DAILY_LIMITS.free;
  const { dailyMessageCount, lastResetDate } = user.aiUsage;

  const needsReset = !lastResetDate || !isSameDay(new Date(lastResetDate), now);
  const currentCount = needsReset ? 0 : dailyMessageCount;

  return {
    allowed: currentCount < limit,
    remaining: Math.max(0, limit - currentCount),
    limit,
    needsReset,
  };
}