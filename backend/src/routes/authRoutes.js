// src/routes/authRoutes.js
import { Router } from "express";
import { register, login, refresh, logout, me, updateProfile } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);

export default router;