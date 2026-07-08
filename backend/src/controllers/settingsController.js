// src/controllers/settingsController.js
import { z } from "zod";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

const preferencesSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  accentColor: z.string().max(20).optional(),
  density: z.enum(["comfortable", "compact"]).optional(),
  dailyStudyGoalHours: z.number().min(0).max(24).optional(),
  cardsPerSession: z.number().int().min(1).max(200).optional(),
  weeklyStudyGoalHours: z.number().min(0).max(168).optional(),
  pomodoroMinutes: z.number().int().min(1).max(180).optional(),
  shortBreakMinutes: z.number().int().min(1).max(60).optional(),
  longBreakMinutes: z.number().int().min(1).max(120).optional(),
  autoStartBreaks: z.boolean().optional(),
  notifications: z
    .object({
      studyReminders: z.boolean().optional(),
      flashcardReminders: z.boolean().optional(),
      deadlineReminders: z.boolean().optional(),
      weeklyReports: z.boolean().optional(),
    })
    .optional(),
});

// GET /api/settings
export async function getSettings(req, res) {
  res.json({ preferences: req.user.preferences });
}

// PATCH /api/settings
export async function updateSettings(req, res, next) {
  try {
    const parsed = preferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

    const { notifications, ...rest } = parsed.data;
    user.preferences = {
      ...user.preferences.toObject(),
      ...rest,
      notifications: {
        ...user.preferences.notifications.toObject(),
        ...(notifications || {}),
      },
    };
    await user.save();

    res.json({ preferences: user.preferences });
  } catch (err) {
    next(err);
  }
}