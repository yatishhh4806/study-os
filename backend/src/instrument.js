// src/instrument.js
// Must be imported first, before any other imports, in both app.js and
// server.js — Sentry needs to patch Node's internals before Express,
// Mongoose, etc. are loaded, to properly instrument them.
import * as Sentry from "@sentry/node";
import { env } from "./config/env.js";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}