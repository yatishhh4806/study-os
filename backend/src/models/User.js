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
      enum: ["created", "authenticated", "active", "pending", "halted", "cancelled", "completed", "none"],
      default: "none",
    },
    razorpaySubscriptionId: { type: String, default: null },
    razorpayPlanId: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { _id: false }
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
    // ── badge-relevant history — these persist across weekly XP resets,
    // since a badge earned once shouldn't be un-earned when the counter
    // that triggered it (weeklyXP, league) resets or drops later ──
    highestLeagueReached: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond", "obsidian"],
      default: "bronze",
    },
    topTenFinishes: { type: Number, default: 0 },
    leagueChampionWins: { type: Number, default: 0 },
  },
  { _id: false }
);

const academicProfileSchema = new mongoose.Schema(
  {
    institutionType: { type: String, enum: ["College / University", "School", null], default: null },
    institutionName: { type: String, default: "", maxlength: 120 },
    // college fields
    course: { type: String, default: "" },
    branch: { type: String, default: "", maxlength: 80 },
    year: { type: String, default: "" },
    semester: { type: String, default: "" },
    // school fields
    schoolClass: { type: String, default: "" },
    stream: { type: String, default: "" },
    board: { type: String, default: "" },
    // extra academic fields the Profile page collects
    enrollmentNo: { type: String, default: "", maxlength: 40 },
    expectedGraduation: { type: String, default: "", maxlength: 40 },
  },
  { _id: false }
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
    passwordHash: { type: String, required: true, select: false },

    role: { type: String, enum: ["student", "admin"], default: "student" },
    avatarUrl: { type: String, default: null },
    institution: { type: String, default: null }, // legacy simple field, kept for backward compatibility
    academicProfile: { type: academicProfileSchema, default: () => ({}) },

    // general personal info — Profile page fields, not academic
    phone: { type: String, default: null, maxlength: 20 },
    dob: { type: Date, default: null },
    location: { type: String, default: null, maxlength: 120 },
    bio: { type: String, default: "", maxlength: 500 },

    emailVerified: { type: Boolean, default: false },
    // TODO SWAP POINT: wire to a real email provider (Resend/SendGrid) to send
    // this token; for now it's generated and stored but never emailed.
    emailVerificationToken: { type: String, select: false, default: null },
    passwordResetToken: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },

    refreshTokenHash: { type: String, select: false, default: null },

    subscription: { type: subscriptionSchema, default: () => ({}) },
    stats: { type: statsSchema, default: () => ({}) },
    aiUsage: {
      dailyMessageCount: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: null },
    },
    preferences: {
      theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
      accentColor: { type: String, default: "#a855f7" },
      density: { type: String, enum: ["comfortable", "compact"], default: "comfortable" },
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
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
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
  return obj;
};

userSchema.methods.isPro = function isPro() {
  return (
    this.subscription.plan === "pro" &&
    ["active", "authenticated"].includes(this.subscription.status)
  );
};

export const User = mongoose.model("User", userSchema);