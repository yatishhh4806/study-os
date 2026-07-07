// src/jobs/scheduler.js
import cron from "node-cron";
import { applyWeeklyLeagueReset } from "./weeklyLeagueReset.js";

export function startScheduledJobs() {
  // "0 0 * * 1" = 00:00 every Monday (server timezone). Adjust the cron
  // expression if you need this pinned to a specific timezone regardless
  // of where the server is hosted — node-cron supports a `timezone` option
  // in its second argument for that.
  cron.schedule("0 0 * * 1", async () => {
    try {
      await applyWeeklyLeagueReset();
    } catch (err) {
      console.error("❌ Weekly league reset failed:", err);
    }
  });

  console.log("🗓️  Scheduled jobs registered (weekly league reset: Mondays 00:00).");
}