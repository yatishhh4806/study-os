// src/controllers/leaderboardController.js
import { User } from "../models/User.js";

// GET /api/leaderboard?scope=league|global
export async function getLeaderboard(req, res, next) {
  try {
    const scope = req.query.scope === "global" ? "global" : "league";

    const filter = scope === "league" ? { "subscription.plan": { $exists: true } } : {};
    if (scope === "league") {
      filter["stats.league"] = req.user.stats.league;
    }

    const users = await User.find(filter)
      .select("name avatarUrl stats.currentStreak stats.weeklyXP stats.league")
      .sort({ "stats.weeklyXP": -1 })
      .limit(100);

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      streak: u.stats.currentStreak,
      weeklyXP: u.stats.weeklyXP,
      league: u.stats.league,
      isYou: u._id.toString() === req.user._id.toString(),
    }));

    res.json({
      scope,
      league: req.user.stats.league,
      leaderboard: ranked,
    });
  } catch (err) {
    next(err);
  }
}