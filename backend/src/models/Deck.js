// src/models/Deck.js
import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
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
      default: null, // decks can exist without being tied to a subject
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true }
);

export const Deck = mongoose.model("Deck", deckSchema);