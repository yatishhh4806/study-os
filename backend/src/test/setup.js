import { beforeAll, afterAll, afterEach, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/studyos-test-placeholder"; // ← real value set below in beforeAll; this just satisfies env.js's validation at import time
process.env.JWT_ACCESS_SECRET = "test_access_secret_at_least_20_chars";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_at_least_20_chars";
process.env.RAZORPAY_KEY_ID = "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET = "dummy_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "dummy_webhook_secret";
process.env.RAZORPAY_PLAN_ID_MONTHLY = "plan_dummy_monthly";
process.env.RAZORPAY_PLAN_ID_YEARLY = "plan_dummy_yearly";
process.env.GROQ_API_KEY = "dummy_groq_key";
process.env.RESEND_API_KEY = "dummy_resend_key";
process.env.YOUTUBE_API_KEY = "dummy_youtube_key";
process.env.GOOGLE_SEARCH_API_KEY = "dummy_search_key";
process.env.GOOGLE_SEARCH_ENGINE_ID = "dummy_engine_id";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri; // overwrites the placeholder with the real in-memory DB URI
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  vi.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});