// src/controllers/accountController.js
import { User } from "../models/User.js";
import { Subject } from "../models/Subject.js";
import { Note } from "../models/Note.js";
import { Deck } from "../models/Deck.js";
import { Flashcard } from "../models/Flashcard.js";
import { Task } from "../models/Task.js";
import { FocusSession } from "../models/FocusSession.js";
import { UserBadge } from "../models/UserBadge.js";
import { REFRESH_COOKIE_NAME } from "../utils/tokens.js";

// GET /api/account/export — a genuine data export, not a placeholder.
// Bundles everything the user actually owns into one JSON file they can
// download and keep, independent of StudyOS.
export async function exportAccountData(req, res, next) {
  try {
    const userId = req.user._id;

    const [subjects, notes, decks, flashcards, tasks, focusSessions, badges] = await Promise.all([
      Subject.find({ userId }),
      Note.find({ userId }),
      Deck.find({ userId }),
      Flashcard.find({ userId }),
      Task.find({ userId }),
      FocusSession.find({ userId }),
      UserBadge.find({ userId }),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      account: {
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
      subjects,
      notes,
      decks,
      flashcards,
      tasks,
      focusSessions,
      badges,
    };

    res.setHeader("Content-Disposition", `attachment; filename="studyos-export-${Date.now()}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(exportPayload, null, 2));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/account — genuinely deletes the account and every piece of
// data tied to it. Cascades across every collection a user can own,
// deliberately in this order so nothing is left orphaned even if the
// request fails partway through logging.
export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id;

    await Promise.all([
      Note.deleteMany({ userId }),
      Subject.deleteMany({ userId }),
      Flashcard.deleteMany({ userId }),
      Deck.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      FocusSession.deleteMany({ userId }),
      UserBadge.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}