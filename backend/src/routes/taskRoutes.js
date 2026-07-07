// src/routes/taskRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listTasks,
  listToday,
  listDeadlines,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router();

router.use(requireAuth);

// specific routes before the generic "/" so Express doesn't try to
// match "today"/"deadlines" as an :id param on a different route
router.get("/today", listToday);
router.get("/deadlines", listDeadlines);

router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.patch("/:id/toggle", toggleTask);
router.delete("/:id", deleteTask);

export default router;