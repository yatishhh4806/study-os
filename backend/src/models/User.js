import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "trialing", "past_due", "canceled", "incomplete", "none"],
      default: "none",
    },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { _id: false }
);

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
    institution: { type: String, default: null },

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false, default: null },
    passwordResetToken: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },

    refreshTokenHash: { type: String, select: false, default: null },

    subscription: { type: subscriptionSchema, default: () => ({}) },
    stats: { type: statsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

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
    ["active", "trialing"].includes(this.subscription.status)
  );
};

export const User = mongoose.model("User", userSchema);