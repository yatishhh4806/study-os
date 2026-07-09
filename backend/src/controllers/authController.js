// src/controllers/authController.js
import { z } from "zod";
import bcrypt from "bcryptjs";
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
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";

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

    const rawVerificationToken = generateRandomToken();
    const user = new User({
      name,
      email,
      passwordHash: password, // hashed by the pre-save hook on User
      emailVerificationToken: hashToken(rawVerificationToken),
    });
    await user.save();

    try {
      await sendVerificationEmail(user, rawVerificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    const accessToken = await issueSession(res, user);
    res.status(201).json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// A fixed, valid bcrypt hash with no corresponding real password. Used only
// to give the "user not found" path the same bcrypt compute cost as the
// "user found, wrong password" path — so response timing can't be used to
// discover which emails are registered (the messages already look
// identical; this closes the timing side-channel too).
const DUMMY_BCRYPT_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8i7d8u4jZ4Yh3g6q3n0z7bT6l5.q9G";

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+passwordHash");

    const isValid = user
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, DUMMY_BCRYPT_HASH);

    if (!user || !isValid) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = await issueSession(res, user);
    res.json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

const googleAuthSchema = z.object({
  // access_token from @react-oauth/google's useGoogleLogin (implicit flow)
  accessToken: z.string().min(1),
});

// POST /api/auth/google  { accessToken }
// Verifies the Google access token by calling Google's userinfo endpoint
// directly, then finds-or-creates a User and issues a session using the
// exact same issueSession() flow as email/password login — so downstream,
// a Google-authenticated session is indistinguishable from a normal one.
export async function googleAuth(req, res, next) {
  try {
    const parsed = googleAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("A Google access token is required", 422, "VALIDATION_ERROR");
    }
    const { accessToken: googleAccessToken } = parsed.data;

    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );

    if (!googleRes.ok) {
      throw new AppError("Google sign-in failed — the token was invalid or expired", 401, "GOOGLE_TOKEN_INVALID");
    }

    const profile = await googleRes.json();
    // profile: { sub, email, email_verified, name, picture, ... }
    if (!profile.email) {
      throw new AppError("Google account has no email associated with it", 400, "NO_GOOGLE_EMAIL");
    }

    const email = profile.email.toLowerCase();

    // 1. Existing Google account — straightforward login
    let user = await User.findOne({ googleId: profile.sub }).select("+passwordHash");

    // 2. No Google-linked account yet, but an email/password account with
    //    this email already exists — link Google to it instead of creating
    //    a duplicate account with the same email
    if (!user) {
      user = await User.findOne({ email }).select("+passwordHash");
      if (user) {
        user.googleId = profile.sub;
        if (profile.picture) user.avatarFromGoogle = profile.picture;
        if (profile.email_verified) user.emailVerified = true;
        await user.save();
      }
    }

    // 3. Brand new user — create an account with no password
    if (!user) {
      user = new User({
        name: profile.name || email.split("@")[0],
        email,
        googleId: profile.sub,
        avatarFromGoogle: profile.picture || null,
        emailVerified: !!profile.email_verified,
      });
      await user.save();
    }

    const accessToken = await issueSession(res, user);
    res.status(200).json({ accessToken, user: user.toSafeJSON() });
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
      throw new AppError("Session no longer valid", 401, "SESSION_INVALID");
    }

    const accessToken = await issueSession(res, user);
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
  enrollmentNo: z.string().max(40).optional(),
  expectedGraduation: z.string().max(40).optional(),
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().max(20).nullable().optional(),
  dob: z.string().nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  bio: z.string().max(500).optional(),
});

const ACADEMIC_KEYS = [
  "institutionType", "institutionName", "course", "branch", "year",
  "semester", "schoolClass", "stream", "board", "enrollmentNo", "expectedGraduation",
];

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

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export async function verifyEmail(req, res, next) {
  try {
    const parsed = verifyEmailSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError("A verification token is required", 422, "VALIDATION_ERROR");
    }

    const hashed = hashToken(parsed.data.token);
    const user = await User.findOne({ emailVerificationToken: hashed }).select(
      "+emailVerificationToken"
    );

    if (!user) {
      throw new AppError("This verification link is invalid or has already been used", 400, "INVALID_TOKEN");
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    res.json({ verified: true });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req, res, next) {
  try {
    if (req.user.emailVerified) {
      return res.json({ message: "Your email is already verified." });
    }

    const rawToken = generateRandomToken();
    req.user.emailVerificationToken = hashToken(rawToken);
    await req.user.save();

    await sendVerificationEmail(req.user, rawToken);
    res.json({ message: "Verification email sent." });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const user = await User.findOne({ email: parsed.data.email });

    if (user) {
      const rawToken = generateRandomToken();
      user.passwordResetToken = hashToken(rawToken);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      try {
        await sendPasswordResetEmail(user, rawToken);
      } catch (emailErr) {
        console.error("Failed to send password reset email:", emailErr);
      }
    }

    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422, "VALIDATION_ERROR");
    }

    const hashed = hashToken(parsed.data.token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw new AppError("This reset link is invalid or has expired", 400, "INVALID_OR_EXPIRED_TOKEN");
    }

    user.passwordHash = parsed.data.newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenHash = null;
    await user.save();

    res.json({ message: "Password updated. Please log in with your new password." });
  } catch (err) {
    next(err);
  }
}