// One-off admin script — resets a user's password directly in the
// database. Run locally with: node scripts/resetPassword.js <email> <newPassword>
// Safe because it's never deployed or exposed as a route; it just uses
// your existing MONGO_URI and the User model's own pre-save hashing hook.
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User.js";

dotenv.config();

async function resetPassword() {
  const [, , email, newPassword] = process.argv;

  if (!email || !newPassword) {
    console.error("Usage: node scripts/resetPassword.js <email> <newPassword>");
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  user.passwordHash = newPassword; // re-hashed automatically by the pre-save hook
  user.refreshTokenHash = null; // invalidate any existing session, same as the real reset-password flow
  await user.save();

  console.log(`✅ Password reset for ${email}. They can log in with the new password now.`);
  await mongoose.disconnect();
  process.exit(0);
}

resetPassword().catch((err) => {
  console.error("Failed to reset password:", err);
  process.exit(1);
});