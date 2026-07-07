// src/controllers/noteController.js
import { z } from "zod";
import mongoose from "mongoose";
import { Note } from "../models/Note.js";
import { Subject } from "../models/Subject.js";
import { AppError } from "../middleware/errorHandler.js";

const blockSchema = z.object({
  id: z.string(),
  type: z.enum(["p", "h1", "h2", "h3", "bullet", "numbered", "todo", "quote", "callout", "code", "divider", "image"]),
  text: z.string().default(""),
  src: z.string().default(""),
  checked: z.boolean().default(false),
});

const createSchema = z.object({
  subjectId: z.string(),
  title: z.string().max(200).default(""),
});

const updateSchema = z.object({
  title: z.string().max(200).optional(),
  starred: z.boolean().optional(),
  cover: z.string().optional(),
  blocks: z.array(blockSchema).optional(),
});

function assertValidId(id, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400, "INVALID_ID");
  }
}

async function assertOwnsSubject(subjectId, userId) {
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    throw new AppError("Subject not found", 404, "NOT_FOUND");
  }
}

// GET /api/notes?subjectId=...&search=...
export async function listNotes(req, res, next) {
  try {
    const { subjectId, search } = req.query;
    const filter = { userId: req.user._id };

    if (subjectId) {
      assertValidId(subjectId, "subjectId");
      filter.subjectId = subjectId;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "blocks.text": { $regex: search, $options: "i" } },
      ];
    }

    const notes = await Note.find(filter).sort({ starred: -1, updatedAt: -1 });
    res.json({ notes });
  } catch (err) {
    next(err);
  }
}

export async function getNote(req, res, next) {
  try {
    assertValidId(req.params.id);
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) throw new AppError("Note not found", 404, "NOT_FOUND");
    res.json({ note });
  } catch (err) {
    next(err);
  }
}

export async function createNote(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    assertValidId(parsed.data.subjectId, "subjectId");
    await assertOwnsSubject(parsed.data.subjectId, req.user._id);

    const note = await Note.create({
      userId: req.user._id,
      subjectId: parsed.data.subjectId,
      title: parsed.data.title,
      blocks: [{ id: "b0", type: "p", text: "" }],
    });

    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
}

// full block array is replaced on each save — the editor sends its whole
// current block list, matching how the frontend's local state already works
export async function updateNote(req, res, next) {
  try {
    assertValidId(req.params.id);
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      parsed.data,
      { new: true, runValidators: true }
    );
    if (!note) throw new AppError("Note not found", 404, "NOT_FOUND");

    res.json({ note });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req, res, next) {
  try {
    assertValidId(req.params.id);
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) throw new AppError("Note not found", 404, "NOT_FOUND");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}