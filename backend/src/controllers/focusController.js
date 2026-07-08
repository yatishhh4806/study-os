// src/controllers/focusController.js
import { z } from "zod";
import mongoose from "mongoose";
import { FocusSession } from "../models/FocusSession.js";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { computeStreakUpdate } from "../utils/streak.js";

const startSchema = z.object({
  subjectId: z.string().nullable().optional(),
  mode: z.enum(["pomodoro", "custom"]).default("pomodoro"),
  plannedMinutes: z.number().int().min(1).max(480).default(25),
});

const completeSchema = z.object({
  distractions: z.number().int().min(0).max(500).default(0),
});

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid id", 400, "INVALID_ID");
  }
}

// POST /api/focus-sessions — start a session (timer begins client-side;
// this just records that one started, in case it's abandoned)
export async function startSession(req, res, next) {
  try {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const session = await FocusSession.create({
      userId: req.user._id,
      subjectId: parsed.data.subjectId || null,
      mode: parsed.data.mode,
      plannedMinutes: parsed.data.plannedMinutes,
      startedAt: new Date(),
    });

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/focus-sessions/:id/complete — marks a session done and
// applies its effects: study minutes, streak, weekly XP. This is the
// single place all of that logic lives, so it can't drift out of sync.
export async function completeSession(req, res, next) {
  try {
    assertValidId(req.params.id);
    const parsed = completeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const session = await FocusSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) throw new AppError("Session not found", 404, "NOT_FOUND");
    if (session.completed) throw new AppError("Session already completed", 409, "ALREADY_COMPLETED");

    const endedAt = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((endedAt - session.startedAt) / 60000)
    );

    session.endedAt = endedAt;
    session.durationMinutes = durationMinutes;
    session.distractions = parsed.data.distractions;
    session.completed = true;
    await session.save();

    const user = await User.findById(req.user._id);
    const streakUpdate = computeStreakUpdate(user.stats, endedAt);

    user.stats.currentStreak = streakUpdate.currentStreak;
    user.stats.bestStreak = streakUpdate.bestStreak;
    user.stats.lastStudyDate = streakUpdate.lastStudyDate;
    user.stats.totalStudyMinutes += durationMinutes;
    // 1 XP per minute focused, small flat bonus for finishing a full pomodoro
    user.stats.weeklyXP += durationMinutes + (session.mode === "pomodoro" ? 5 : 0);
    await user.save();

    res.json({
      session,
      streak: {
        current: user.stats.currentStreak,
        best: user.stats.bestStreak,
        changed: streakUpdate.streakChanged,
      },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/focus-sessions/:id — for abandoned/accidental sessions;
// no stats were applied since it was never completed, so nothing to undo
export async function abandonSession(req, res, next) {
  try {
    assertValidId(req.params.id);
    const session = await FocusSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      completed: false, // safety: never allow deleting a completed session's record
    });
    if (!session) throw new AppError("Session not found or already completed", 404, "NOT_FOUND");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /api/focus-sessions?days=30 — raw session list, mapped into the
// exact shape FocusAnalytics.jsx already expects as its `sessions` prop
// (id, type, date, startTime, durationMin, plannedMin, distractions,
// completed). Deliberately separate from /heatmap, which only returns
// day-level aggregates — the "Peak Focus Period" and per-day breakdown
// need per-session detail that aggregate can't provide.
export async function listSessions(req, res, next) {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await FocusSession.find({
      userId: req.user._id,
      startedAt: { $gte: since },
    }).sort({ startedAt: -1 });

    const mapped = sessions.map((s) => {
      const d = new Date(s.startedAt);
      const pad = (n) => String(n).padStart(2, "0");
      return {
        id: s._id,
        type: "focus", // breaks are never sent to this API at all — see PomodoroTimer.jsx
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        startTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        durationMin: s.durationMinutes,
        plannedMin: s.plannedMinutes,
        distractions: s.distractions,
        completed: s.completed,
      };
    });

    res.json({ sessions: mapped });
  } catch (err) {
    next(err);
  }
}

// GET /api/focus-sessions/heatmap?days=30 — daily totals for the Dashboard's
// study heatmap widget
export async function getHeatmap(req, res, next) {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const results = await FocusSession.aggregate([
      { $match: { userId: req.user._id, completed: true, startedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          totalMinutes: { $sum: "$durationMinutes" },
          sessionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ days: results });
  } catch (err) {
    next(err);
  }
}

// GET /api/focus-sessions/stats — the denormalized numbers the Dashboard
// reads directly (streak, best streak, total hours) plus this week's total
export async function getStats(req, res, next) {
  try {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekAgg = await FocusSession.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true,
          startedAt: { $gte: startOfWeek },
        },
      },
      { $group: { _id: null, totalMinutes: { $sum: "$durationMinutes" } } },
    ]);

    res.json({
      currentStreak: req.user.stats.currentStreak,
      bestStreak: req.user.stats.bestStreak,
      totalStudyMinutes: req.user.stats.totalStudyMinutes,
      weeklyXP: req.user.stats.weeklyXP,
      thisWeekMinutes: weekAgg[0]?.totalMinutes || 0,
    });
  } catch (err) {
    next(err);
  }
}