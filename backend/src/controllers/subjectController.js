// src/controllers/subjectController.js
import { z } from "zod";
import mongoose from "mongoose";
import { Subject } from "../models/Subject.js";
import { Note } from "../models/Note.js";
import { AppError } from "../middleware/errorHandler.js";

const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  emoji: z.string().max(8).optional(),
  color: z.string().max(20).optional(),
});

const updateSchema = createSchema.partial();

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid id", 400, "INVALID_ID");
  }
}

export async function listSubjects(req, res, next) {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({
      createdAt: 1,
    });

    // include a live note count per subject so the frontend doesn't need
    // a second round trip just to render the sidebar counts
    const counts = await Note.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$subjectId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count]),
    );

    res.json({
      subjects: subjects.map((s) => ({
        ...s.toObject(),
        noteCount: countMap[s._id.toString()] || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createSubject(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        422,
        "VALIDATION_ERROR",
      );
    }

    const existing = await Subject.findOne({
      userId: req.user._id,
      name: parsed.data.name,
    });
    if (existing) {
      throw new AppError(
        "A subject with this name already exists",
        409,
        "DUPLICATE_SUBJECT",
      );
    }

    const subject = await Subject.create({
      ...parsed.data,
      userId: req.user._id,
    });
    res.status(201).json({ subject });
  } catch (err) {
    next(err);
  }
}

export async function updateSubject(req, res, next) {
  try {
    assertValidId(req.params.id);
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0].message,
        422,
        "VALIDATION_ERROR",
      );
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      parsed.data,
      { returnDocument: "after" },
    );
    if (!subject) {
      throw new AppError("Subject not found", 404, "NOT_FOUND");
    }
    res.json({ subject });
  } catch (err) {
    next(err);
  }
}

export async function deleteSubject(req, res, next) {
  try {
    assertValidId(req.params.id);

    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!subject) {
      throw new AppError("Subject not found", 404, "NOT_FOUND");
    }

    // cascade — a subject with orphaned notes would be confusing to
    // debug later, so clean them up in the same request
    await Note.deleteMany({ subjectId: req.params.id, userId: req.user._id });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
