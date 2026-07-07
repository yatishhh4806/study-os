// src/controllers/deckController.js
import { z } from "zod";
import mongoose from "mongoose";
import { Deck } from "../models/Deck.js";
import { Flashcard } from "../models/Flashcard.js";
import { AppError } from "../middleware/errorHandler.js";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(300).optional(),
  subjectId: z.string().nullable().optional(),
});

const updateSchema = createSchema.partial();

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid id", 400, "INVALID_ID");
  }
}

export async function listDecks(req, res, next) {
  try {
    const decks = await Deck.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // attach live due/total counts so the frontend can show "12 due" per
    // deck without a separate round trip per deck
    const now = new Date();
    const counts = await Flashcard.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$deckId",
          total: { $sum: 1 },
          due: { $sum: { $cond: [{ $lte: ["$dueDate", now] }, 1, 0] } },
        },
      },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));

    res.json({
      decks: decks.map((d) => ({
        ...d.toObject(),
        totalCards: countMap[d._id.toString()]?.total || 0,
        dueCards: countMap[d._id.toString()]?.due || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createDeck(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }
    const deck = await Deck.create({ ...parsed.data, userId: req.user._id });
    res.status(201).json({ deck });
  } catch (err) {
    next(err);
  }
}

export async function updateDeck(req, res, next) {
  try {
    assertValidId(req.params.id);
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const deck = await Deck.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      parsed.data,
      { returnDocument: "after" }
    );
    if (!deck) throw new AppError("Deck not found", 404, "NOT_FOUND");
    res.json({ deck });
  } catch (err) {
    next(err);
  }
}

export async function deleteDeck(req, res, next) {
  try {
    assertValidId(req.params.id);
    const deck = await Deck.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deck) throw new AppError("Deck not found", 404, "NOT_FOUND");

    await Flashcard.deleteMany({ deckId: req.params.id, userId: req.user._id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}