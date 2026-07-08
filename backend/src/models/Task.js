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

    // ── Planner-specific fields ──
    category: {
      type: String,
      enum: ["study", "assignment", "exam", "personal", "reminder", "meeting", "other", null],
      default: null,
    },
    color: { type: String, default: null }, // hex string, independent of category
    allDay: { type: Boolean, default: false },
    // NOTE: reminder/repeat are stored as selected so nothing is silently
    // dropped when saving from the Planner UI, but neither is functional
    // yet — reminder does not schedule a real notification, and repeat
    // does not generate future occurrences. Both need real features
    // (a notification delivery system; a recurrence-expansion engine)
    // before they do anything beyond remembering the user's choice.
    reminder: { type: String, default: null },
    repeat: { type: String, default: null },

    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// speeds up "today's schedule" and "upcoming deadlines" queries, both of
// which filter by userId + a date range and sort by date
taskSchema.index({ userId: 1, date: 1 });

export const Task = mongoose.model("Task", taskSchema);