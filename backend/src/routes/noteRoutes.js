// src/routes/noteRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
