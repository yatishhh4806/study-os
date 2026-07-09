// src/routes/billingRoutes.js
import { Router } from "express";
import {
  createSubscription,
  cancelSubscription,
  handleRazorpayWebhook,
} from "../controllers/billingController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/subscribe", requireAuth, createSubscription);
router.post("/cancel", requireAuth, cancelSubscription);

// req.body here is already a raw Buffer, not parsed JSON — server.js/app.js
// applies express.raw() to this exact path before express.json() runs,
// which the webhook signature verification requires.
router.post("/webhook", handleRazorpayWebhook);

export default router;