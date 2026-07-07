// src/routes/flashcardRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
} from "../controllers/flashcardController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listFlashcards);
router.post("/", createFlashcard);
router.patch("/:id", updateFlashcard);
router.delete("/:id", deleteFlashcard);
router.post("/:id/review", reviewFlashcard);

export default router;