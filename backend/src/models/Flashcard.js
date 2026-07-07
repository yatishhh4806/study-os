// src/models/Flashcard.js
import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
      index: true,
    },
    front: { type: String, required: true, trim: true, maxlength: 500 },
    back: { type: String, required: true, trim: true, maxlength: 1000 },

    // ── SM-2 scheduling state ──
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 }, // days
    repetitions: { type: Number, default: 0 },
    dueDate: { type: Date, default: Date.now, index: true }, // due immediately until first review
    lastReviewedAt: { type: Date, default: null },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// speeds up "give me this deck's due cards" — the single most frequent
// query this collection will see
flashcardSchema.index({ userId: 1, deckId: 1, dueDate: 1 });

export const Flashcard = mongoose.model("Flashcard", flashcardSchema);