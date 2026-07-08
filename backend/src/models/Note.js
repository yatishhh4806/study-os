// src/models/Note.js
import mongoose from "mongoose";

// mirrors the block shape used by the NotesPage editor on the frontend
// (id, type, text, src for images, checked for todos) so the API can be
// a near-direct swap-in for the mock state there.
const blockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["p", "h1", "h2", "h3", "bullet", "numbered", "todo", "quote", "callout", "code", "divider", "image"],
      default: "p",
    },
    text: { type: String, default: "" },
    src: { type: String, default: "" },
    checked: { type: Boolean, default: false },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    title: { type: String, default: "", trim: true, maxlength: 200 },
    starred: { type: Boolean, default: false },
    cover: { type: String, default: "" },
    blocks: { type: [blockSchema], default: () => [{ id: "b0", type: "p", text: "" }] },
  },
  { timestamps: true }
);

// speeds up "list notes for this subject, newest/starred first" queries
noteSchema.index({ userId: 1, subjectId: 1, updatedAt: -1 });

export const Note = mongoose.model("Note", noteSchema);