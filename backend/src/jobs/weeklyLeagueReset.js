// src/jobs/weeklyLeagueReset.js
import { User } from "../models/User.js";
import { LEAGUE_ORDER, PROMOTE_COUNT, DEMOTE_COUNT, nextLeagueUp, nextLeagueDown } from "../utils/leagues.js";

/**
 * Runs once a week (see jobs/scheduler.js). For each league tier:
 *   1. Pull every user currently in that league, sorted by weeklyXP desc
 *   2. Top PROMOTE_COUNT move up a tier, bottom DEMOTE_COUNT move down
 *   3. Everyone's weeklyXP resets to 0 for the new week
 *
 * This has to run as one atomic pass across all users at a single point in
 * time — a lazy "check on next request" approach (like the streak check)
 * doesn't work here, because promotion/demotion depends on comparing
 * everyone's standing at the same moment, not whoever happens to load the
 * page first.
 */
export async function applyWeeklyLeagueReset() {
  console.log("🏆 Running weekly league reset...");
  let totalPromoted = 0;
  let totalDemoted = 0;

  // snapshot global standing BEFORE any promotions/demotions or the XP
  // reset below — this is what badge counters (top 10, champion) are
  // based on, since they mean "this week's actual performance"
  const globalRanked = await User.find({})
    .select("_id stats.weeklyXP")
    .sort({ "stats.weeklyXP": -1 });

  const topTenIds = globalRanked.slice(0, 10).map((u) => u._id);
  const championId = globalRanked[0]?._id;

  if (topTenIds.length) {
    await User.updateMany(
      { _id: { $in: topTenIds } },
      { $inc: { "stats.topTenFinishes": 1 } }
    );
  }
  if (championId) {
    await User.updateOne(
      { _id: championId },
      { $inc: { "stats.leagueChampionWins": 1 } }
    );
  }

  for (const league of LEAGUE_ORDER) {
    const members = await User.find({ "stats.league": league })
      .select("_id stats.weeklyXP stats.league stats.highestLeagueReached")
      .sort({ "stats.weeklyXP": -1 });

    if (members.length === 0) continue;

    const promoteIds = members.slice(0, PROMOTE_COUNT).map((m) => m._id);
    const demoteIds = members.slice(-DEMOTE_COUNT).map((m) => m._id);

    if (league !== LEAGUE_ORDER[LEAGUE_ORDER.length - 1] && promoteIds.length) {
      const newLeague = nextLeagueUp(league);
      await User.updateMany(
        { _id: { $in: promoteIds } },
        { "stats.league": newLeague }
      );
      // bump highestLeagueReached for anyone whose new league surpasses
      // their previous best — badge progress should reflect a lifetime
      // high point, not just current standing
      const newIdx = LEAGUE_ORDER.indexOf(newLeague);
      for (const m of members) {
        if (!promoteIds.some((p) => p.equals(m._id))) continue;
        const prevIdx = LEAGUE_ORDER.indexOf(m.stats.highestLeagueReached);
        if (newIdx > prevIdx) {
          await User.updateOne({ _id: m._id }, { "stats.highestLeagueReached": newLeague });
        }
      }
      totalPromoted += promoteIds.length;
    }

    if (league !== LEAGUE_ORDER[0] && demoteIds.length) {
      // avoid demoting someone who was already promoted this pass (only
      // relevant in leagues with very few members where the two slices overlap)
      const safeDemoteIds = demoteIds.filter(
        (id) => !promoteIds.some((p) => p.equals(id))
      );
      if (safeDemoteIds.length) {
        await User.updateMany(
          { _id: { $in: safeDemoteIds } },
          { "stats.league": nextLeagueDown(league) }
        );
        totalDemoted += safeDemoteIds.length;
      }
    }
  }

  // reset everyone's weekly counter for the new week, after promotions/
  // demotions and badge counters above have all used last week's real standings
  await User.updateMany({}, { "stats.weeklyXP": 0 });

  console.log(`🏆 Weekly reset complete — ${totalPromoted} promoted, ${totalDemoted} demoted.`);
}