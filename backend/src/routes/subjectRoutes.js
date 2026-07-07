// src/routes/subjectRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

const router = Router();

router.use(requireAuth); // every route below requires a logged-in user

router.get("/", listSubjects);
router.post("/", createSubject);
router.patch("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;