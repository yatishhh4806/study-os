// src/models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    notes: { type: String, default: "", maxlength: 1000 },

    // a task can be a plain checklist item (no date), a scheduled block
    // (date + startTime), or a deadline (date + urgency) — the frontend
    // decides how to render it based on which fields are present
    date: { type: Date, default: null, index: true },
    startTime: { type: String, default: null }, // "HH:mm", kept as string to avoid timezone math for a simple time-of-day label
    endTime: { type: String, default: null },

    urgency: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },

    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// speeds up "today's schedule" and "upcoming deadlines" queries, both of
// which filter by userId + a date range and sort by date
taskSchema.index({ userId: 1, date: 1 });

export const Task = mongoose.model("Task", taskSchema);