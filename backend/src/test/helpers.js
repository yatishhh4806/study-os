import { User } from "../models/User.js";
import { Subject } from "../models/Subject.js";
import { signAccessToken } from "../utils/tokens.js";

// Creates a real user in the in-memory DB and returns both the user doc
// and a valid access token — the token generation bypasses the login
// flow entirely (no HTTP round-trip needed) since Notes tests just need
// *a* valid authenticated user, not to re-test login itself.
export async function createTestUser(overrides = {}) {
  const user = await User.create({
    name: "Test User",
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash: "Password123!", // hashed by the pre-save hook
    emailVerified: true,
    ...overrides,
  });

  const accessToken = signAccessToken(user._id.toString());
  return { user, accessToken };
}

export async function createTestSubject(userId, overrides = {}) {
  return Subject.create({
    userId,
    name: "Test Subject",
    ...overrides,
  });
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}