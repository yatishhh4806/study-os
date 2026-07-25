// src/pages/TermsOfService.jsx
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

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#09070f] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-120 w-120 rounded-full bg-purple-500/10 blur-[160px]" />
        <div className="absolute -left-20 bottom-0 h-96 w-[24rem] rounded-full bg-fuchsia-500/6 blur-[160px]" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to StudyOS
        </Link>

        <h1 className="text-3xl font-black mb-2">Terms of Service</h1>
        <p className="text-sm text-white/40 mb-10">Last updated: {LAST_UPDATED}</p>

        <Section title="1. Acceptance of Terms">
          <p>
            By creating an account or using StudyOS, you agree to these Terms of Service. StudyOS
            is currently in active development and open testing — features may change, break, or
            be removed without notice as the platform evolves. If you do not agree to these terms,
            please do not use StudyOS.
          </p>
        </Section>

        <Section title="2. The Service">
          <p>
            StudyOS is an academic productivity platform providing notes, flashcards, an AI Tutor,
            a planner, focus/Pomodoro tools, gamified progress tracking, and related features. It
            is provided on an "as is" and "as available" basis, without warranties of any kind.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>
            You must provide accurate information when creating an account. You are responsible
            for maintaining the security of your account credentials and for all activity that
            occurs under your account. You must be old enough to consent to use of a service like
            StudyOS under the laws of your country, or have the consent of a parent or guardian.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>Use StudyOS for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to other accounts or to StudyOS's systems</li>
            <li>Interfere with or disrupt the service, including through excessive automated requests</li>
            <li>Misuse AI features to generate harmful, abusive, or illegal content</li>
            <li>Reverse-engineer or resell access to StudyOS without permission</li>
          </ul>
        </Section>

        <Section title="5. AI-Generated Content">
          <p>
            StudyOS's AI Tutor, AI-generated flashcards, and AI-generated roadmaps are powered by
            third-party AI models (Groq) and are provided for study assistance only. AI-generated
            content may be inaccurate or incomplete, and should not be treated as a substitute for
            verified academic sources, textbooks, or instructor guidance.
          </p>
        </Section>

        <Section title="6. Subscriptions & Payments">
          <p>
            StudyOS offers an optional Pro subscription, billed through Razorpay on a monthly or
            yearly interval. Subscriptions renew automatically unless cancelled. You may cancel at
            any time from Settings → Billing; your Pro access remains active until the end of the
            current billing period. Refunds, where applicable, are subject to Razorpay's and
            applicable law's standard terms.
          </p>
        </Section>

        <Section title="7. Third-Party Integrations">
          <p>
            Optional integrations (Google Sign-In, GitHub Sign-In, Spotify) are governed by the
            respective third party's own terms of service, in addition to these terms. Spotify
            playback control requires an active Spotify Premium account, per Spotify's own API
            restrictions — this is outside StudyOS's control.
          </p>
        </Section>

        <Section title="8. Your Content">
          <p>
            You retain ownership of the notes, flashcards, tasks, and other content you create in
            StudyOS. You can export a full copy of your data at any time, and permanently delete
            your account and all associated content from Settings → Danger Zone.
          </p>
        </Section>

        <Section title="9. Service Availability">
          <p>
            As an actively developed, independently maintained project, StudyOS does not guarantee
            uninterrupted availability. Features described as "coming soon" are not yet available,
            and the platform may experience downtime, bugs, or data resets during this testing
            phase without advance notice.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, StudyOS and its developer are not liable for
            any indirect, incidental, or consequential damages arising from your use of the
            service, including loss of data, study progress, or academic outcomes.
          </p>
        </Section>

        <Section title="11. Termination">
          <p>
            You may stop using StudyOS and delete your account at any time. We reserve the right to
            suspend or terminate accounts that violate these terms or engage in abusive behavior
            toward the service or other users.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            These terms may be updated as StudyOS develops. Continued use of StudyOS after changes
            are posted constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these terms can be directed to the developer via the contact
            information on the StudyOS portfolio/GitHub page.
          </p>
        </Section>
      </div>
    </div>
  );
}