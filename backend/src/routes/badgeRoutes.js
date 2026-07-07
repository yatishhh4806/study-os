// src/routes/badgeRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getBadges } from "../controllers/badgeController.js";

const router = Router();

router.use(requireAuth);
router.get("/", getBadges);

export default router;