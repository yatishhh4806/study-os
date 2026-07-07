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
  institutionType: z.enum(["College / University", "School"]).optional(),
  institutionName: z.string().max(120).optional(),
  course: z.string().max(40).optional(),
  branch: z.string().max(80).optional(),
  year: z.string().max(40).optional(),
  semester: z.string().max(40).optional(),
  schoolClass: z.string().max(40).optional(),
  stream: z.string().max(40).optional(),
  board: z.string().max(40).optional(),
});

// PATCH /api/auth/profile — saves the academic details collected in
// signup step 2 (or editable later from a real Profile/Settings page)
export async function updateProfile(req, res, next) {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { academicProfile: { ...req.user.academicProfile.toObject(), ...parsed.data } },
      { new: true, runValidators: true }
    );

    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}