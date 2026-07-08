// src/controllers/taskController.js
import { z } from "zod";
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { AppError } from "../middleware/errorHandler.js";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  notes: z.string().max(1000).optional(),
  subjectId: z.string().nullable().optional(),
  date: z.string().datetime().nullable().optional(), // ISO string from the client
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  urgency: z.enum(["low", "medium", "high"]).nullable().optional(),
  category: z.enum(["study", "assignment", "exam", "personal", "reminder", "meeting", "other"]).nullable().optional(),
  color: z.string().nullable().optional(),
  allDay: z.boolean().optional(),
  reminder: z.string().nullable().optional(),
  repeat: z.string().nullable().optional(),
});

const updateSchema = createSchema.partial();

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid id", 400, "INVALID_ID");
  }
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// GET /api/tasks?from=...&to=...  — generic range query, powers the Planner calendar
export async function listTasks(req, res, next) {
  try {
    const { from, to } = req.query;
    const filter = { userId: req.user._id };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const tasks = await Task.find(filter).sort({ date: 1, startTime: 1 });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/today — powers the Dashboard's "Today's Schedule" card
export async function listToday(req, res, next) {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      date: { $gte: startOfDay(), $lte: endOfDay() },
    }).sort({ startTime: 1 });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/deadlines?limit=5 — powers the Dashboard's "Deadlines" card:
// upcoming, incomplete, has an urgency set, soonest first
export async function listDeadlines(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const tasks = await Task.find({
      userId: req.user._id,
      completed: false,
      urgency: { $ne: null },
      date: { $gte: startOfDay() },
    })
      .sort({ date: 1 })
      .limit(limit);

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }
    const task = await Task.create({ ...parsed.data, userId: req.user._id });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    assertValidId(req.params.id);
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      parsed.data,
      { returnDocument: "after" }
    );
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id/toggle — dedicated endpoint for the common
// "click the checkbox" action, since it's the most frequent write
export async function toggleTask(req, res, next) {
  try {
    assertValidId(req.params.id);

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    assertValidId(req.params.id);
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}