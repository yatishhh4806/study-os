// api/cron/weekly-reset.js
import { connectDB } from "../../src/config/db.js";
import { applyWeeklyLeagueReset } from "../../src/jobs/weeklyLeagueReset.js";
import { env } from "../../src/config/env.js";

function isAuthorizedCronRequest(req) {
  if (!env.CRON_SECRET) return true; // no secret configured — allow (dev/local)
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${env.CRON_SECRET}`;
}

export default async function handler(req, res) {
  if (!isAuthorizedCronRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Hobby plan only allows once-per-day cron cadence, so this fires daily
  // and only actually runs the reset on Mondays (UTC) — same real behavior
  // as the old node-cron "0 0 * * 1" schedule used in local dev, just
  // triggered differently since there's no persistent process here to
  // hold a weekly timer.
  const isMonday = new Date().getUTCDay() === 1;
  if (!isMonday) {
    return res.status(200).json({ ran: false, reason: "not Monday (UTC)" });
  }

  try {
    await connectDB();
    await applyWeeklyLeagueReset();
    res.status(200).json({ ran: true });
  } catch (err) {
    console.error("Weekly league reset failed:", err);
    res.status(500).json({ ran: false, error: err.message });
  }
}