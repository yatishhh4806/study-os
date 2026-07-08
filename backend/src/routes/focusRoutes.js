// src/routes/focusRoutes.JS
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  startSession,
  completeSession,
  abandonSession,
  getHeatmap,
  getStats,
  listSessions,
} from "../controllers/focusController.js";

const router = Router();

router.use(requireAuth);

router.get("/stats", getStats);
router.get("/heatmap", getHeatmap);
router.get("/", listSessions);

router.post("/", startSession);
router.patch("/:id/complete", completeSession);
router.delete("/:id", abandonSession);

export default router;