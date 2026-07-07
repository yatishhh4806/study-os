// src/routes/aiTutorRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { chat, getUsage } from "../controllers/aiTutorController.js";

const router = Router();

router.use(requireAuth);

router.get("/usage", getUsage);
router.post("/chat", chat);

export default router;