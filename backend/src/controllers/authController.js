// src/controllers/authController.js
import { z } from "zod";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "../utils/tokens.js";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

async function issueSession(res, user) {
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }
    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("An account with this email already exists", 409, "EMAIL_TAKEN");
    }

    const user = new User({
      name,
      email,
      passwordHash: password, // hashed by the pre-save hook on User
      emailVerificationToken: generateRandomToken(),
    });
    await user.save();

    // TODO SWAP POINT: send user.emailVerificationToken via a real email
    // provider here. Account works without verification for now.

    const accessToken = await issueSession(res, user);
    res.status(201).json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await user.comparePassword(password))) {
      // deliberately vague — don't reveal which field was wrong
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = await issueSession(res, user);
    res.json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new AppError("No refresh token provided", 401, "NO_REFRESH_TOKEN");
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError("Refresh token invalid or expired", 401, "INVALID_REFRESH_TOKEN");
    }

    const user = await User.findById(payload.sub).select("+refreshTokenHash");
    if (!user || user.refreshTokenHash !== hashToken(token)) {
      // token reuse or revoked session — force re-login
      throw new AppError("Session no longer valid", 401, "SESSION_INVALID");
    }

    const accessToken = await issueSession(res, user); // rotates refresh token too
    res.json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await User.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
      } catch {
        // token already invalid — nothing to revoke, fall through to clear cookie
      }
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

const profileSchema = z.object({
  // academic
  institutionType: z.enum(["College / University", "School"]).optional(),
  institutionName: z.string().max(120).optional(),
  course: z.string().max(40).optional(),
  branch: z.string().max(80).optional(),
  year: z.string().max(40).optional(),
  semester: z.string().max(40).optional(),
  schoolClass: z.string().max(40).optional(),
  stream: z.string().max(40).optional(),
  board: z.string().max(40).optional(),
  enrollmentNo: z.string().max(40).optional(),
  expectedGraduation: z.string().max(40).optional(),
  // personal — name is safe to allow editing here too, same validation
  // as at registration
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().max(20).nullable().optional(),
  dob: z.string().nullable().optional(), // ISO date string, e.g. "1998-04-12"
  location: z.string().max(120).nullable().optional(),
  bio: z.string().max(500).optional(),
});

const ACADEMIC_KEYS = [
  "institutionType", "institutionName", "course", "branch", "year",
  "semester", "schoolClass", "stream", "board", "enrollmentNo", "expectedGraduation",
];

// PATCH /api/auth/profile — saves both academic details (signup step 2,
// or later edits from the Profile page) and general personal info
// (name, phone, dob, location, bio) in a single call. Email is
// deliberately NOT accepted here — changing a login email is a real
// feature (usually needs re-verification) that doesn't exist yet, so
// it's kept read-only on the frontend rather than silently no-op'd here.
export async function updateProfile(req, res, next) {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

    const academicUpdates = {};
    const topLevelUpdates = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (ACADEMIC_KEYS.includes(key)) academicUpdates[key] = value;
      else if (key !== "dob") topLevelUpdates[key] = value;
    }

    if (Object.keys(academicUpdates).length) {
      user.academicProfile = { ...user.academicProfile.toObject(), ...academicUpdates };
    }
    Object.assign(user, topLevelUpdates);
    if (parsed.data.dob !== undefined) {
      user.dob = parsed.data.dob ? new Date(parsed.data.dob) : null;
    }

    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}