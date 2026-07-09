// src/routes/authRoutes.js
import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleAuth,
} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);

router.get("/verify-email", verifyEmail);
router.post("/resend-verification", requireAuth, resendVerification);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/google", authLimiter, googleAuth);

export default router;