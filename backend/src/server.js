// src/server.js
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { startScheduledJobs } from "./jobs/scheduler.js";

// This entry point is for local development (npm run dev) only. The
// deployed-to-Vercel version uses api/index.js instead, which shares this
// same app.js but skips .listen() and the node-cron scheduler — neither
// works in a serverless environment (no persistent process to hold a
// timer or listen on a port). See api/cron/weekly-reset.js for how the
// weekly reset runs once deployed instead.
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