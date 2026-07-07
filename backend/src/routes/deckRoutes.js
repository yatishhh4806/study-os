// src/routes/deckRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listDecks, createDeck, updateDeck, deleteDeck } from "../controllers/deckController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listDecks);
router.post("/", createDeck);
router.patch("/:id", updateDeck);
router.delete("/:id", deleteDeck);

export default router;