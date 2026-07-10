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
  githubAuthRedirect,
  githubAuthCallback,
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

// GitHub's flow is a full-page redirect, not a fetch call, so these
// intentionally aren't behind authLimiter in the same way — GitHub itself
// rate-limits the redirect step, and the callback is a one-time code
// exchange, not a repeatable brute-forceable action like login.
router.get("/github", githubAuthRedirect);
router.get("/github/callback", githubAuthCallback);

export default router;