// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    // Razorpay subscription statuses: created (checkout opened, not yet
    // paid), authenticated/active (paid, live), pending (payment retrying),
    // halted (payment failed repeatedly), cancelled, completed (ran its
    // full cycle count), none (never subscribed)
    status: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "pending",
        "halted",
        "cancelled",
        "completed",
        "none",
      ],
      default: "none",
    },
    razorpaySubscriptionId: { type: String, default: null },
    razorpayPlanId: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { _id: false },
);

// denormalized gamification fields — kept on User for fast dashboard/leaderboard
// reads instead of aggregating across collections on every page load. Recomputed
// by the relevant controllers (focus sessions, quizzes, etc.) when they fire.
const statsSchema = new mongoose.Schema(
  {
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastStudyDate: { type: Date, default: null },
    totalStudyMinutes: { type: Number, default: 0 },
    weeklyXP: { type: Number, default: 0 },
    league: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond", "obsidian"],
      default: "bronze",
    },
    highestLeagueReached: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond", "obsidian"],
      default: "bronze",
    },
    topTenFinishes: { type: Number, default: 0 },
    leagueChampionWins: { type: Number, default: 0 },
  },
  { _id: false },
);

const academicProfileSchema = new mongoose.Schema(
  {
    institutionType: {
      type: String,
      enum: ["College / University", "School", null],
      default: null,
    },
    institutionName: { type: String, default: "", maxlength: 120 },
    course: { type: String, default: "" },
    branch: { type: String, default: "", maxlength: 80 },
    year: { type: String, default: "" },
    semester: { type: String, default: "" },
    schoolClass: { type: String, default: "" },
    stream: { type: String, default: "" },
    board: { type: String, default: "" },
    enrollmentNo: { type: String, default: "", maxlength: 40 },
    expectedGraduation: { type: String, default: "", maxlength: 40 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Not required for Google-authenticated accounts — those users never
    // set a password, so this is conditionally required based on whether
    // a googleId is present. Google users can still add a password later
    // via a "set password" flow (not built yet) if they want email/password
    // login as a backup.
    passwordHash: {
      type: String,
      required: function requirePasswordUnlessOAuth() {
        return !this.googleId && !this.githubId;
      },
      select: false,
    },

    // Present only for accounts created or linked via Google Sign-In.
    // Sparse+unique so multiple docs can have googleId: null/undefined
    // without violating the unique index.
    googleId: { type: String, unique: true, sparse: true, select: false },
    avatarFromGoogle: { type: String, default: null },

    // Same pattern as googleId, for GitHub Sign-In.
    githubId: { type: String, unique: true, sparse: true, select: false },
    avatarFromGithub: { type: String, default: null },
    githubUsername: { type: String, default: null },

    role: { type: String, enum: ["student", "admin"], default: "student" },
    avatarUrl: { type: String, default: null },
    institution: { type: String, default: null }, // legacy simple field, kept for backward compatibility
    academicProfile: { type: academicProfileSchema, default: () => ({}) },

    phone: { type: String, default: null, maxlength: 20 },
    dob: { type: Date, default: null },
    location: { type: String, default: null, maxlength: 120 },
    bio: { type: String, default: "", maxlength: 500 },

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false, default: null },
    passwordResetToken: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },

    refreshTokenHash: { type: String, select: false, default: null },

    spotify: {
      connected: {
        type: Boolean,
        default: false,
      },

      spotifyUserId: {
        type: String,
        default: null,
      },

      displayName: {
        type: String,
        default: null,
      },

      email: {
        type: String,
        default: null,
      },

      accessToken: {
        type: String,
        default: null,
        select: false,
      },

      refreshToken: {
        type: String,
        default: null,
        select: false,
      },

      expiresAt: {
        type: Date,
        default: null,
      },

      avatar: {
        type: String,
        default: null,
      },

      selectedPlaylistId: {
        type: String,
        default: null,
      },

      selectedPlaylistName: {
        type: String,
        default: null,
      },
    },

    subscription: { type: subscriptionSchema, default: () => ({}) },
    stats: { type: statsSchema, default: () => ({}) },
    aiUsage: {
      dailyMessageCount: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: null },
    },
    preferences: {
      theme: {
        type: String,
        enum: ["dark", "light", "system"],
        default: "dark",
      },
      accentColor: { type: String, default: "#a855f7" },
      density: {
        type: String,
        enum: ["comfortable", "compact"],
        default: "comfortable",
      },
      dailyStudyGoalHours: { type: Number, default: 4 },
      cardsPerSession: { type: Number, default: 20 },
      weeklyStudyGoalHours: { type: Number, default: 30 },
      pomodoroMinutes: { type: Number, default: 25 },
      shortBreakMinutes: { type: Number, default: 5 },
      longBreakMinutes: { type: Number, default: 15 },
      autoStartBreaks: { type: Boolean, default: true },
      notifications: {
        studyReminders: { type: Boolean, default: true },
        flashcardReminders: { type: Boolean, default: true },
        deadlineReminders: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();
  if (!this.passwordHash) return next(); // Google-only accounts have none
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.passwordHash) return Promise.resolve(false); // Google-only account, no password to compare
  return bcrypt.compare(candidate, this.passwordHash);
};

// never leak sensitive fields even if a controller forgets to .select("-x")
userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.googleId;
  delete obj.githubId;
  if (obj.spotify) {
    delete obj.spotify.accessToken;
    delete obj.spotify.refreshToken;
  }
  return obj;
};

userSchema.methods.isPro = function isPro() {
  return (
    this.subscription.plan === "pro" &&
    ["active", "authenticated"].includes(this.subscription.status)
  );
};

export const User = mongoose.model("User", userSchema);