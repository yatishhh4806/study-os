// src/middleware/auth.js
import { verifyAccessToken } from "../utils/tokens.js";
import { User } from "../models/User.js";
import { checkStreakStillValid } from "../utils/streak.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    // lazy streak correction — see utils/streak.js for why this lives here
    // instead of a cron job for now
    const streakCheck = checkStreakStillValid(user.stats);
    if (streakCheck.needsUpdate) {
      user.stats.currentStreak = streakCheck.currentStreak;
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid access token" });
  }
}

// gates routes/features behind an active Pro subscription
export function requirePro(req, res, next) {
  if (!req.user?.isPro()) {
    return res.status(402).json({
      error: "This feature requires a Pro subscription",
      code: "UPGRADE_REQUIRED",
    });
  }
  next();
}