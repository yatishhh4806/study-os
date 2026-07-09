// src/config/env.js
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SENTRY_DSN: z.string().url().optional(),

  // Comma-separated list of allowed frontend origins, e.g.:
  // "http://localhost:5173,https://study0s.vercel.app"
  // This lets local dev and the deployed frontend both work without ever
  // swapping this value back and forth between environments.
  CLIENT_URL: z
    .string()
    .min(1, "CLIENT_URL is required")
    .transform((val) => val.split(",").map((url) => url.trim()))
    .refine(
      (urls) => urls.every((url) => z.string().url().safeParse(url).success),
      { message: "CLIENT_URL must be a comma-separated list of valid URLs" }
    ),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(20, "JWT_ACCESS_SECRET must be at least 20 chars"),
  JWT_REFRESH_SECRET: z.string().min(20, "JWT_REFRESH_SECRET must be at least 20 chars"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  // Razorpay — swapped from Stripe since Stripe is invite-only in India
  // and doesn't support UPI, the dominant payment method for Indian users.
  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, "RAZORPAY_WEBHOOK_SECRET is required"),
  RAZORPAY_PLAN_ID_MONTHLY: z.string().min(1),
  RAZORPAY_PLAN_ID_YEARLY: z.string().min(1),

  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),

  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().email().default("onboarding@resend.dev"),
  YOUTUBE_API_KEY: z.string().min(1, "YOUTUBE_API_KEY is required"),
  GOOGLE_SEARCH_API_KEY: z.string().min(1, "GOOGLE_SEARCH_API_KEY is required"),
  GOOGLE_SEARCH_ENGINE_ID: z.string().min(1, "GOOGLE_SEARCH_ENGINE_ID is required"),

  // secures /api/cron/weekly-reset — Vercel sends this automatically as a
  // Bearer token when it invokes a scheduled cron job. Optional locally.
  CRON_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
// env.CLIENT_URL is now an array, e.g. ["http://localhost:5173", "https://study0s.vercel.app"]