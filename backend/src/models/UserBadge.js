// src/models/UserBadge.js
import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeId: { type: String, required: true }, // matches an id in utils/badgeCatalog.js
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = mongoose.model("UserBadge", userBadgeSchema);