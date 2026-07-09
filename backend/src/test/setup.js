import { beforeAll, afterAll, afterEach, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Tests need real env values before any app code (which validates env on
// import) runs. Setting these here, before other imports resolve, avoids
// needing a separate .env.test file just for CI/local test runs.
process.env.NODE_ENV = "test";
process.env.CLIENT_URL = "http://localhost:5173";
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
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
});

afterEach(async () => {
  // wipe all collections between tests so each test starts from a clean
  // slate, without needing to re-spin up MongoDB every time (slow)
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