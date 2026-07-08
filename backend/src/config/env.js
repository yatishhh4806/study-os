// src/config/env.js
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().url(),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(20, "JWT_ACCESS_SECRET must be at least 20 chars"),
  JWT_REFRESH_SECRET: z.string().min(20, "JWT_REFRESH_SECRET must be at least 20 chars"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  STRIPE_PRICE_ID_PRO_MONTHLY: z.string().min(1),
  STRIPE_PRICE_ID_PRO_YEARLY: z.string().min(1),

  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),

  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().email().default("onboarding@resend.dev"),

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