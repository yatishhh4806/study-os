// src/models/FocusSession.js
import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
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

    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 }, // set when completed

    mode: {
      type: String,
      enum: ["pomodoro", "custom"],
      default: "pomodoro",
    },
    completed: { type: Boolean, default: false }, // false = abandoned/still running
  },
  { timestamps: true }
);

// powers the heatmap ("last 30 days" view) and any date-range history query
focusSessionSchema.index({ userId: 1, startedAt: 1 });

export const FocusSession = mongoose.model("FocusSession", focusSessionSchema);