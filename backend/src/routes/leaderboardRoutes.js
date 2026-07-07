// src/routes/leaderboardRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getLeaderboard } from "../controllers/leaderboardController.js";

const router = Router();

router.use(requireAuth);
router.get("/", getLeaderboard);

export default router;