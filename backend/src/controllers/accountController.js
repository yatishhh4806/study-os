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