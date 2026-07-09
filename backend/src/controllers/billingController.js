// src/controllers/billingController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

const PLAN_IDS = {
  monthly: env.RAZORPAY_PLAN_ID_MONTHLY,
  yearly: env.RAZORPAY_PLAN_ID_YEARLY,
};

const subscribeSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
});

// POST /api/billing/subscribe  { interval }
// Unlike Stripe (which returns a hosted checkout URL to redirect to),
// Razorpay's checkout is a JS modal that opens directly on our own page.
// This endpoint just creates the subscription object server-side and
// hands back what the frontend needs to open that modal — the actual
// payment UI/flow happens client-side via Razorpay's checkout.js.
export async function createSubscription(req, res, next) {
  try {
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const planId = PLAN_IDS[parsed.data.interval];
    if (!planId) {
      throw new AppError("Invalid billing interval", 422, "VALIDATION_ERROR");
    }

    const user = req.user;

    // Razorpay subscriptions need a total_count of billing cycles up
    // front — there's no "bill forever until cancelled" flag like
    // Stripe's. Using a large count (60 months / 5 years) approximates
    // "indefinite" — cancellation is handled separately via the cancel
    // endpoint below, same as any real subscription.
    const totalCount = parsed.data.interval === "monthly" ? 60 : 5;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: totalCount,
      // notes travel through to the webhook payload unmodified — this is
      // how we match a webhook event back to the right user, since we
      // aren't pre-creating a separate Razorpay Customer object
      notes: { userId: user._id.toString() },
    });

    user.subscription.razorpaySubscriptionId = subscription.id;
    user.subscription.razorpayPlanId = planId;
    user.subscription.status = subscription.status; // "created" at this point — not paid yet
    await user.save();

    res.json({
      subscriptionId: subscription.id,
      keyId: env.RAZORPAY_KEY_ID,
      name: "StudyOS",
      description: parsed.data.interval === "monthly" ? "StudyOS Pro — Monthly" : "StudyOS Pro — Yearly",
      prefill: { name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/billing/cancel
// Cancels at the end of the current billing cycle rather than
// immediately — same "keep access until period end" behavior Stripe's
// hosted portal gave us, just built ourselves since Razorpay doesn't
// have an equivalent hosted portal.
export async function cancelSubscription(req, res, next) {
  try {
    const user = req.user;
    const subId = user.subscription.razorpaySubscriptionId;
    if (!subId) {
      throw new AppError("No active subscription found", 400, "NO_SUBSCRIPTION");
    }

    await razorpay.subscriptions.cancel(subId, { cancel_at_cycle_end: 1 });

    user.subscription.cancelAtPeriodEnd = true;
    await user.save();

    res.json({ message: "Your subscription will end at the close of the current billing period." });
  } catch (err) {
    next(err);
  }
}

// Razorpay signs the raw webhook body with HMAC-SHA256 using the webhook
// secret — a different mechanism than Stripe's signature scheme, but the
// same underlying goal: prove the request genuinely came from Razorpay.
function verifyWebhookSignature(rawBody, signatureHeader) {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signatureHeader;
}

// POST /api/billing/webhook — this route must receive the RAW request
// body (see server.js/app.js), not JSON-parsed, or signature
// verification fails, same requirement as the old Stripe integration.
export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature || !verifyWebhookSignature(req.body, signature)) {
    console.error("Razorpay webhook signature verification failed");
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch (err) {
    console.error("Failed to parse Razorpay webhook body:", err);
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const subscriptionEntity = event.payload?.subscription?.entity;
    const userId = subscriptionEntity?.notes?.userId;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        await applySubscriptionEvent(user, event.event, subscriptionEntity);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Error processing Razorpay webhook:", err);
    // still 200 so Razorpay doesn't retry forever on our internal bug;
    // the error is logged for manual investigation instead
    res.status(200).json({ received: true, note: "processed with internal error" });
  }
}

async function applySubscriptionEvent(user, eventType, subscriptionEntity) {
  switch (eventType) {
    case "subscription.authenticated":
    case "subscription.activated":
      user.subscription.plan = "pro";
      user.subscription.status = subscriptionEntity.status;
      if (subscriptionEntity.current_end) {
        user.subscription.currentPeriodEnd = new Date(subscriptionEntity.current_end * 1000);
      }
      break;

    case "subscription.charged":
      // a renewal payment succeeded — extend the period, plan stays pro
      user.subscription.plan = "pro";
      user.subscription.status = "active";
      if (subscriptionEntity.current_end) {
        user.subscription.currentPeriodEnd = new Date(subscriptionEntity.current_end * 1000);
      }
      break;

    case "subscription.pending":
      // a renewal payment is being retried — don't downgrade yet, Razorpay
      // will keep trying for a few days before giving up
      user.subscription.status = "pending";
      break;

    case "subscription.halted":
    case "subscription.cancelled":
    case "subscription.completed":
      user.subscription.plan = "free";
      user.subscription.status = eventType.split(".")[1];
      user.subscription.cancelAtPeriodEnd = false;
      break;

    default:
      // unhandled event types are fine to ignore
      return;
  }

  await user.save();
}