// src/controllers/badgeController.js
import { Note } from "../models/Note.js";
import { Flashcard } from "../models/Flashcard.js";
import { FocusSession } from "../models/FocusSession.js";
import { UserBadge } from "../models/UserBadge.js";
import { BADGE_CATALOG } from "../utils/badgeCatalog.js";
import { LEAGUE_ORDER } from "../utils/leagues.js";

async function gatherBadgeContext(user) {
  const [noteCount, reviewAgg, earlyBirdCount, nightOwlCount] = await Promise.all([
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
  ]);

  return {
    bestStreak: user.stats.bestStreak,
    noteCount,
    totalFlashcardReviews: reviewAgg[0]?.totalReviews || 0,
    earlyBirdSessions: earlyBirdCount,
    nightOwlSessions: nightOwlCount,
    topTenFinishes: user.stats.topTenFinishes,
    leagueChampionWins: user.stats.leagueChampionWins,
    highestLeagueReachedIndex: LEAGUE_ORDER.indexOf(user.stats.highestLeagueReached),
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