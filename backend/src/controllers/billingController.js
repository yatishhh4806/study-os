import Stripe from "stripe";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  monthly: env.STRIPE_PRICE_ID_PRO_MONTHLY,
  yearly: env.STRIPE_PRICE_ID_PRO_YEARLY,
};

export async function createCheckoutSession(req, res, next) {
  try {
    const { interval } = req.body;
    const priceId = PRICE_IDS[interval];
    if (!priceId) {
      throw new AppError("Invalid billing interval", 422, "VALIDATION_ERROR");
    }

    const user = req.user;

    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.CLIENT_URL}/dashboard/settings?billing=success`,
      cancel_url: `${env.CLIENT_URL}/dashboard/settings?billing=canceled`,
      metadata: { userId: user._id.toString() },
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
}

export async function createPortalSession(req, res, next) {
  try {
    const user = req.user;
    if (!user.subscription.stripeCustomerId) {
      throw new AppError("No billing account found for this user", 400, "NO_CUSTOMER");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${env.CLIENT_URL}/dashboard/settings`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
}

export async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await syncSubscriptionFromStripe(session.customer, session.subscription);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await syncSubscriptionFromStripe(subscription.customer, subscription.id);
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Error processing Stripe webhook:", err);
    res.status(200).json({ received: true, note: "processed with internal error" });
  }
}

async function syncSubscriptionFromStripe(stripeCustomerId, stripeSubscriptionId) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const user = await User.findOne({ "subscription.stripeCustomerId": stripeCustomerId });
  if (!user) return;

  user.subscription.stripeSubscriptionId = subscription.id;
  user.subscription.status = subscription.status;
  user.subscription.plan = ["active", "trialing"].includes(subscription.status) ? "pro" : "free";
  user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
  await user.save();
}