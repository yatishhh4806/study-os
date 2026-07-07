// src/models/Subject.js
import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    emoji: { type: String, default: "📘" },
    color: { type: String, default: "#a855f7" },
  },
  { timestamps: true }
);

// a user shouldn't have two subjects with the exact same name
subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", subjectSchema);