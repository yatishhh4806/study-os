// src/utils/email.js
import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

// Resend's shared onboarding@resend.dev sender works immediately with zero
// domain verification — fine for getting this working now. Once you verify
// your own domain in Resend's dashboard, swap EMAIL_FROM to something like
// noreply@yourdomain.com for better deliverability/branding.
export async function sendVerificationEmail(user, token) {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: user.email,
    subject: "Verify your StudyOS email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #a855f7;">Welcome to StudyOS, ${user.name}!</h2>
        <p>Confirm your email address to finish setting up your account.</p>
        <a href="${verifyUrl}" style="display:inline-block; background:#a855f7; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color:#666; font-size:13px;">Or paste this link into your browser: ${verifyUrl}</p>
        <p style="color:#999; font-size:12px;">If you didn't create a StudyOS account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: user.email,
    subject: "Reset your StudyOS password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #a855f7;">Reset your password</h2>
        <p>Hi ${user.name}, click below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block; background:#a855f7; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color:#666; font-size:13px;">Or paste this link into your browser: ${resetUrl}</p>
        <p style="color:#999; font-size:12px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      </div>
    `,
  });
}