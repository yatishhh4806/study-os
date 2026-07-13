// src/controllers/badgeController.js
import { Note } from "../models/Note.js";
import { Flashcard } from "../models/Flashcard.js";
import { FocusSession } from "../models/FocusSession.js";
import { Subject } from "../models/Subject.js";
import { Deck } from "../models/Deck.js";
import { UserBadge } from "../models/UserBadge.js";
import { BADGE_CATALOG } from "../utils/badgeCatalog.js";
import { LEAGUE_ORDER } from "../utils/leagues.js";

// Same "mature card" mastery-per-subject logic used by the dashboard's
// Subject Mastery widget — a card that's survived 3+ spaced-repetition
// reviews counts as mature. Kept as its own query here (rather than
// importing dashboardController directly) since badges only need the
// mastery percentages themselves, not the rest of the dashboard payload.
async function getSubjectMasteryPercentages(userId) {
  const subjects = await Subject.find({ userId }).select("_id");
  if (!subjects.length) return [];

  const decks = await Deck.find({ userId }).select("_id subjectId");
  const deckToSubject = Object.fromEntries(
    decks.map((d) => [d._id.toString(), d.subjectId?.toString()])
  );

  const cardStats = await Flashcard.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$deckId",
        total: { $sum: 1 },
        mature: { $sum: { $cond: [{ $gte: ["$repetitions", 3] }, 1, 0] } },
      },
    },
  ]);

  const bySubject = {};
  for (const row of cardStats) {
    const subjectId = deckToSubject[row._id.toString()];
    if (!subjectId) continue;
    if (!bySubject[subjectId]) bySubject[subjectId] = { total: 0, mature: 0 };
    bySubject[subjectId].total += row.total;
    bySubject[subjectId].mature += row.mature;
  }

  return subjects.map((s) => {
    const stat = bySubject[s._id.toString()] || { total: 0, mature: 0 };
    return stat.total ? Math.round((stat.mature / stat.total) * 100) : 0;
  });
}

async function gatherBadgeContext(user) {
  const [
    noteCount,
    reviewAgg,
    earlyBirdCount,
    nightOwlCount,
    completedFocusSessions,
    masteryPercentages,
  ] = await Promise.all([
    Note.countDocuments({ userId: user._id }),

    Flashcard.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, totalReviews: { $sum: "$totalReviews" } } },
    ]),

    FocusSession.countDocuments({
      userId: user._id,
      completed: true,
      $expr: { $lt: [{ $hour: "$startedAt" }, 7] },
    }),

    FocusSession.countDocuments({
      userId: user._id,
      completed: true,
      $expr: { $lt: [{ $hour: "$startedAt" }, 5] },
    }),

    FocusSession.countDocuments({ userId: user._id, completed: true }),

    getSubjectMasteryPercentages(user._id),
  ]);

  return {
    bestStreak: user.stats.bestStreak,
    noteCount,
    totalFlashcardReviews: reviewAgg[0]?.totalReviews || 0,
    earlyBirdSessions: earlyBirdCount,
    nightOwlSessions: nightOwlCount,
    completedFocusSessions,
    totalStudyMinutes: user.stats.totalStudyMinutes || 0,
    topTenFinishes: user.stats.topTenFinishes,
    leagueChampionWins: user.stats.leagueChampionWins,
    highestLeagueReachedIndex: LEAGUE_ORDER.indexOf(user.stats.highestLeagueReached),
    maxMasteryPct: masteryPercentages.length ? Math.max(...masteryPercentages) : 0,
    subjectsAt80Plus: masteryPercentages.filter((p) => p >= 80).length,
  };
}

// GET /api/badges
export async function getBadges(req, res, next) {
  try {
    const ctx = await gatherBadgeContext(req.user);
    const existing = await UserBadge.find({ userId: req.user._id });
    const unlockedMap = Object.fromEntries(existing.map((b) => [b.badgeId, b.unlockedAt]));

    const results = [];
    const newlyUnlocked = [];

    for (const badge of BADGE_CATALOG) {
      const progress = badge.getProgress(ctx);
      const alreadyUnlocked = Boolean(unlockedMap[badge.id]);
      const justUnlocked = !alreadyUnlocked && progress >= badge.target;

      if (justUnlocked) {
        newlyUnlocked.push(badge.id);
      }

      results.push({
        id: badge.id,
        category: badge.category,
        rarity: badge.rarity,
        name: badge.name,
        desc: badge.desc,
        target: badge.target,
        progress: Math.min(progress, badge.target),
        unlocked: alreadyUnlocked || justUnlocked,
        unlockedAt: unlockedMap[badge.id] || (justUnlocked ? new Date() : null),
      });
    }

    // persist any badges that just crossed their threshold — done as a
    // bulk insert with ignored duplicate errors, so a race between two
    // requests can't create the same badge twice
    if (newlyUnlocked.length) {
      await UserBadge.insertMany(
        newlyUnlocked.map((badgeId) => ({ userId: req.user._id, badgeId })),
        { ordered: false }
      ).catch(() => {
        // duplicate key errors here just mean another request already
        // inserted the same badge a moment earlier — safe to ignore
      });
    }

    const unlockedCount = results.filter((b) => b.unlocked).length;

    res.json({
      badges: results,
      unlockedCount,
      totalCount: results.length,
      newlyUnlocked, // frontend can use this to show an "unlocked!" toast
    });
  } catch (err) {
    next(err);
  }
}