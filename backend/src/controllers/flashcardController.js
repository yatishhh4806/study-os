// src/controllers/flashcardController.js
import { z } from "zod";
import mongoose from "mongoose";
import { Flashcard } from "../models/Flashcard.js";
import { Deck } from "../models/Deck.js";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { scheduleNextReview } from "../utils/sm2.js";

const createSchema = z.object({
  deckId: z.string(),
  front: z.string().trim().min(1).max(500),
  back: z.string().trim().min(1).max(1000),
});

const updateSchema = z.object({
  front: z.string().trim().min(1).max(500).optional(),
  back: z.string().trim().min(1).max(1000).optional(),
});

const reviewSchema = z.object({
  quality: z.number().int().min(0).max(5),
});

function assertValidId(id, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400, "INVALID_ID");
  }
}

async function assertOwnsDeck(deckId, userId) {
  const deck = await Deck.findOne({ _id: deckId, userId });
  if (!deck) throw new AppError("Deck not found", 404, "NOT_FOUND");
}

// GET /api/flashcards?deckId=...&due=true
export async function listFlashcards(req, res, next) {
  try {
    const { deckId, due } = req.query;
    const filter = { userId: req.user._id };

    if (deckId) {
      assertValidId(deckId, "deckId");
      filter.deckId = deckId;
    }
    if (due === "true") {
      filter.dueDate = { $lte: new Date() };
    }

    const cards = await Flashcard.find(filter).sort({ dueDate: 1 });
    res.json({ flashcards: cards });
  } catch (err) {
    next(err);
  }
}

export async function createFlashcard(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }
    assertValidId(parsed.data.deckId, "deckId");
    await assertOwnsDeck(parsed.data.deckId, req.user._id);

    const card = await Flashcard.create({ ...parsed.data, userId: req.user._id });
    res.status(201).json({ flashcard: card });
  } catch (err) {
    next(err);
  }
}

export async function updateFlashcard(req, res, next) {
  try {
    assertValidId(req.params.id);
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const card = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      parsed.data,
      { returnDocument: "after" }
    );
    if (!card) throw new AppError("Flashcard not found", 404, "NOT_FOUND");
    res.json({ flashcard: card });
  } catch (err) {
    next(err);
  }
}

export async function deleteFlashcard(req, res, next) {
  try {
    assertValidId(req.params.id);
    const card = await Flashcard.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!card) throw new AppError("Flashcard not found", 404, "NOT_FOUND");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// POST /api/flashcards/:id/review  { quality: 0-5 }
// This is the one endpoint that actually advances spaced-repetition state —
// everything else here is plain CRUD.
export async function reviewFlashcard(req, res, next) {
  try {
    assertValidId(req.params.id);
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) throw new AppError("Flashcard not found", 404, "NOT_FOUND");

    const { quality } = parsed.data;
    const next5 = scheduleNextReview(
      { easeFactor: card.easeFactor, interval: card.interval, repetitions: card.repetitions },
      quality
    );

    card.easeFactor = next5.easeFactor;
    card.interval = next5.interval;
    card.repetitions = next5.repetitions;
    card.dueDate = next5.dueDate;
    card.lastReviewedAt = new Date();
    card.totalReviews += 1;
    await card.save();

    // award XP for the review — small, deliberate coupling to the
    // gamification fields on User; a passed card is worth more than a
    // failed one, since failing still shows engagement but not mastery
    const xpGain = quality >= 3 ? 10 : 3;
    await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.weeklyXP": xpGain } });

    res.json({ flashcard: card, xpGain });
  } catch (err) {
    next(err);
  }
}