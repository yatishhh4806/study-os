// src/config/db.js
import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Caches the connection (or in-flight connection promise) on the global
// object. This matters most for serverless (many invocations per minute,
// each a fresh execution context, would otherwise exhaust Atlas's
// connection limit) — but it's equally correct and harmless for the
// traditional long-running local server, which just reuses the same
// cached connection for its whole lifetime anyway.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.MONGO_URI, {
        maxPoolSize: 10,
        bufferCommands: false,
      })
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}