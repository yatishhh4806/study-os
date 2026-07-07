import { Router } from "express";
import {
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhook,
} from "../controllers/billingController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/checkout", requireAuth, createCheckoutSession);
router.post("/portal", requireAuth, createPortalSession);

// req.body here is already a raw Buffer, not parsed JSON — server.js
// applies express.raw() to this exact path before express.json() runs,
// which Stripe's signature verification requires. Do not add body-parsing
// middleware here.
router.post("/webhook", handleStripeWebhook);

export default router;