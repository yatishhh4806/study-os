// src/server.js
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { startScheduledJobs } from "./jobs/scheduler.js";

import authRoutes from "./routes/authRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import deckRoutes from "./routes/deckRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import focusRoutes from "./routes/focusRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import aiTutorRoutes from "./routes/aiTutorRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

import * as Sentry from "@sentry/node";
import { env } from "./config/env.js";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
  });
}

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.CLIENT_URL.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());

app.use("/api/billing/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "2mb" }));
app.use(apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/focus-sessions", focusRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/ai-tutor", aiTutorRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/resources", resourceRoutes);

app.get("/api/debug-sentry", () => {
  throw new Error("Testing Sentry error reporting");
});

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDB();
  startScheduledJobs();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 StudyOS API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start();