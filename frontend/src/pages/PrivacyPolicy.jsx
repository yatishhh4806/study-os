// src/pages/PrivacyPolicy.jsx
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "July 21, 2026";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-white/60">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#09070f] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-[30rem] w-[30rem] rounded-full bg-purple-500/10 blur-[160px]" />
        <div className="absolute -left-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/[0.06] blur-[160px]" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to StudyOS
        </Link>

        <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-white/40 mb-10">Last updated: {LAST_UPDATED}</p>

        <Section title="1. Overview">
          <p>
            StudyOS ("we", "us", "our") is an academic productivity platform built for students.
            This policy explains what information we collect, how we use it, and the choices you
            have. StudyOS is an actively developed, independent project — currently in open
            testing — and this policy will be updated as the platform evolves.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong className="text-white/80">Account information:</strong> name, email address, and — if you sign up with a password — a securely hashed version of it. We never store your password in plain text.</p>
          <p><strong className="text-white/80">OAuth sign-in:</strong> if you sign in with Google or GitHub, we receive your name, email address, and profile picture from that provider. We do not receive or store your Google or GitHub password.</p>
          <p><strong className="text-white/80">Academic profile:</strong> information you choose to provide, such as institution, course, branch, year, and similar academic details.</p>
          <p><strong className="text-white/80">Content you create:</strong> notes, flashcards, tasks, planner entries, and focus session history.</p>
          <p><strong className="text-white/80">Spotify integration:</strong> if you connect Spotify, we store your Spotify display name, avatar, and the access/refresh tokens needed to control playback on your behalf. We do not access your listening history beyond what's needed to display and control your currently selected playlist.</p>
          <p><strong className="text-white/80">Payment information:</strong> if you upgrade to Pro, payments are processed by Razorpay. We do not store your card or UPI details — we only retain subscription status and billing metadata (such as renewal dates) needed to manage your plan.</p>
          <p><strong className="text-white/80">Usage data:</strong> basic technical data such as error logs (via Sentry) to help us find and fix bugs.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>Provide and maintain your account and the features you use</li>
            <li>Power AI features (such as the AI Tutor and AI-generated flashcards/roadmaps) via our AI provider, Groq</li>
            <li>Process payments and manage subscriptions via Razorpay</li>
            <li>Control Spotify playback on your behalf, if connected</li>
            <li>Diagnose and fix technical issues</li>
            <li>Communicate with you about your account, when necessary</li>
          </ul>
        </Section>

        <Section title="4. Third-Party Services">
          <p>
            StudyOS relies on the following third-party services to operate. Each processes a
            limited slice of your data solely to provide their respective function:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li><strong className="text-white/80">MongoDB Atlas</strong> — database hosting</li>
            <li><strong className="text-white/80">Vercel</strong> — application hosting</li>
            <li><strong className="text-white/80">Google / GitHub</strong> — optional sign-in</li>
            <li><strong className="text-white/80">Razorpay</strong> — payment processing</li>
            <li><strong className="text-white/80">Groq</strong> — AI features</li>
            <li><strong className="text-white/80">Spotify</strong> — optional music playback, if connected</li>
            <li><strong className="text-white/80">Resend</strong> — transactional email (verification, password reset)</li>
            <li><strong className="text-white/80">Sentry</strong> — error monitoring</li>
          </ul>
          <p>We do not sell your personal data to anyone, for any purpose.</p>
        </Section>

        <Section title="5. Data Retention & Deletion">
          <p>
            We retain your data for as long as your account is active. You can permanently delete
            your account and all associated data — notes, flashcards, tasks, focus sessions, and
            badges — at any time from Settings → Danger Zone. This action is immediate and
            irreversible.
          </p>
          <p>
            You can also export a full copy of your data at any time by contacting us, independent
            of any decision to delete your account.
          </p>
        </Section>

        <Section title="6. Cookies & Sessions">
          <p>
            We use a single httpOnly cookie to store your refresh token, which keeps you signed in
            securely between visits. This cookie cannot be read by JavaScript and is not used for
            advertising or cross-site tracking.
          </p>
        </Section>

        <Section title="7. Data Security">
          <p>
            Passwords are hashed with bcrypt and never stored in plain text. Sensitive fields
            (tokens, password hashes) are excluded from API responses by default. That said, no
            system is perfectly secure, and as an actively developed project, StudyOS's security
            practices continue to mature over time.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            StudyOS is intended for students, including those under 18. We do not knowingly collect
            more information than is necessary to provide the service, and we encourage younger
            students to review this policy with a parent or guardian if unsure.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            As StudyOS is under active development, this policy may change as new features are
            added. Material changes will be reflected by updating the "Last updated" date above.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about this policy or your data can be directed to the developer via the
            contact information on the StudyOS portfolio/GitHub page.
          </p>
        </Section>
      </div>
    </div>
  );
}