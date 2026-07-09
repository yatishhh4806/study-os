// src/pages/Settings.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  BookOpen,
  Bell,
  Database,
  Cloud,
  Shield,
  Trash2,
  Download,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertTriangle,
  KeyRound,
  Smartphone,
  LogOut,
  GitBranch,
  Loader2,
  Timer,
  CreditCard,
  Crown,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const NAV_SECTIONS = [
  { id: "appearance",    label: "Appearance",        icon: Palette },
  { id: "billing",       label: "Billing",           icon: CreditCard },
  { id: "study",         label: "Study Preferences", icon: BookOpen },
  { id: "focus",         label: "Focus & Pomodoro",  icon: Timer },
  { id: "notifications", label: "Notifications",     icon: Bell },
  { id: "data",          label: "Data & Backup",     icon: Database },
  { id: "integrations",  label: "Integrations",      icon: Cloud },
  { id: "security",      label: "Security",          icon: Shield },
  { id: "danger",        label: "Danger Zone",       icon: Trash2 },
];

const ACCENTS = [
  { name: "Purple",  value: "#a855f7" },
  { name: "Blue",    value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Pink",    value: "#ec4899" },
  { name: "Amber",   value: "#f59e0b" },
];

// ── small reusable controls ─────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
        checked ? "bg-purple-500" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1 gap-1">
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            value === v
              ? "bg-purple-500 text-white shadow-sm"
              : "text-white/55 hover:text-white hover:bg-white/5"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step = 1, unit = "" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm text-white/60">{label}</label>
        <span className="text-sm font-semibold text-purple-300 tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-purple-500"
        style={{
          background: `linear-gradient(to right, #a855f7 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      />
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-white/60">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-purple-400/50 transition-colors"
      />
    </div>
  );
}

function SectionCard({ id, icon: Icon, title, description, children, sectionRef, tone = "purple" }) {
  const toneClasses =
    tone === "danger"
      ? "border-red-500/20 hover:border-red-500/30"
      : "border-white/10 hover:border-purple-400/20";
  const iconTone = tone === "danger" ? "text-red-400" : "text-purple-400";

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`scroll-mt-6 rounded-2xl border ${toneClasses} bg-white/[0.03] backdrop-blur-xl p-6 sm:p-7 transition-colors`}
    >
      <div className="flex items-start gap-3 mb-6">
        <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 ${iconTone}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && <p className="text-sm text-white/45 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { logout, user, refreshUser } = useAuth();

  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // danger zone modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const flashSaved = useCallback((msg = "Saved") => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // debounce PATCH calls so dragging a slider doesn't fire a request per pixel
  const saveTimer = useRef(null);
  const savePrefs = useCallback((patch) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.patch("/settings", patch);
        flashSaved();
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
    }, 400);
  }, [flashSaved]);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/settings");
        setPrefs(data.preferences);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Razorpay's checkout is a JS modal that opens on our own page — no
  // redirect away and back, unlike Stripe. This loads checkout.js once,
  // the first time it's actually needed, rather than on every page load.
  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
      document.body.appendChild(script);
    });
  }

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      await loadRazorpayScript();
      const { data } = await api.post("/billing/subscribe", { interval: billingInterval });

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: data.name,
        description: data.description,
        prefill: data.prefill,
        theme: { color: "#a855f7" },
        handler: function () {
          // Payment succeeded client-side. The webhook is the real source
          // of truth for activation (it can arrive a moment after this
          // callback fires), so we optimistically inform the user and
          // then refetch shortly after to pick up the confirmed state.
          flashSaved("Payment received! Activating your Pro plan...");
          setTimeout(() => refreshUser(), 3000);
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
          },
        },
      });

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        flashSaved("Payment failed — please try again");
        setCheckoutLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Failed to start checkout:", err);
      flashSaved("Couldn't start checkout — try again");
      setCheckoutLoading(false);
    }
  }

  // Razorpay doesn't have a hosted billing portal the way Stripe does —
  // cancellation is a real endpoint we built ourselves (see
  // billingController.js), so this needs its own confirmation step
  // rather than handing off to a third-party page.
  async function handleCancelSubscription() {
    if (!window.confirm("Cancel your Pro subscription? You'll keep access until the end of your current billing period.")) {
      return;
    }
    setPortalLoading(true);
    try {
      await api.post("/billing/cancel");
      await refreshUser();
      flashSaved("Subscription set to cancel at period end.");
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      flashSaved("Couldn't cancel — try again");
    } finally {
      setPortalLoading(false);
    }
  }

  // active nav highlight on scroll
  const [activeSection, setActiveSection] = useState(NAV_SECTIONS[0].id);
  const sectionRefs = useRef({});
  const scrollAreaRef = useRef(null);

  const setSectionRef = useCallback(
    (id) => (el) => {
      if (el) sectionRefs.current[id] = el;
    },
    []
  );

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 4;
      if (atBottom) {
        setActiveSection(NAV_SECTIONS[NAV_SECTIONS.length - 1].id);
        return;
      }
      let closestId = NAV_SECTIONS[0].id;
      let closestDist = Infinity;
      for (const { id } of NAV_SECTIONS) {
        const node = sectionRefs.current[id];
        if (!node) continue;
        const dist = Math.abs(node.getBoundingClientRect().top - 96);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = id;
        }
      }
      setActiveSection(closestId);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function handleExport() {
    setExporting(true);
    try {
      const res = await api.get("/account/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `studyos-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      flashSaved("Export downloaded");
    } catch (err) {
      console.error("Export failed:", err);
      flashSaved("Export failed — try again");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await api.delete("/account");
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
      flashSaved("Delete failed — try again");
      setDeleting(false);
    }
  }

  if (loading || !prefs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09070f]">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09070f] text-white overflow-hidden">
      <style>{`
        @keyframes settingsToastIn {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes settingsModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .settings-toast { animation: settingsToastIn 0.25s ease-out both; }
        .settings-modal-in { animation: settingsModalIn 0.2s ease-out both; }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(168,85,247,0.5);
          cursor: pointer;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-[30rem] w-[30rem] rounded-full bg-purple-500/10 blur-[160px]" />
        <div className="absolute -left-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/[0.06] blur-[160px]" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* ── Left nav ─────────────────────────────────────── */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-sm px-4 py-8 relative z-30 overflow-y-auto">
          <h1 className="text-2xl font-black px-2 mb-1">Settings</h1>
          <p className="text-sm text-white/40 px-2 mb-8">Customize your StudyOS experience.</p>

          <nav className="flex flex-col gap-1">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  activeSection === id
                    ? "bg-purple-500/15 border border-purple-400/30 text-white"
                    : "border border-transparent text-white/55 hover:text-white hover:bg-white/5"
                } ${id === "danger" ? "mt-4 text-red-400/80 hover:text-red-300" : ""}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ──────────────────────────────────────── */}
        <div ref={scrollAreaRef} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-3xl mx-auto px-6 py-8 lg:py-10 space-y-6">
            <div className="lg:hidden mb-2">
              <h1 className="text-3xl font-black">Settings</h1>
              <p className="text-white/40 mt-1">Customize your StudyOS experience.</p>
            </div>

            {/* Appearance */}
            <SectionCard
              id="appearance"
              icon={Palette}
              title="Appearance"
              description="How StudyOS looks on your screen."
              sectionRef={setSectionRef("appearance")}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60 block mb-2.5">Theme</label>
                  <Segmented
                    value={prefs.theme}
                    onChange={(v) => savePrefs({ theme: v })}
                    options={[
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "light", label: "Light", icon: Sun },
                      { value: "system", label: "System", icon: Monitor },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 block mb-2.5">Interface Density</label>
                  <Segmented
                    value={prefs.density}
                    onChange={(v) => savePrefs({ density: v })}
                    options={[
                      { value: "comfortable", label: "Comfortable", icon: Sun },
                      { value: "compact", label: "Compact", icon: Moon },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm text-white/60 block mb-3">Accent Color</label>
                <div className="flex gap-3">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.value}
                      title={a.name}
                      onClick={() => savePrefs({ accentColor: a.value })}
                      className="relative w-9 h-9 rounded-full transition-transform hover:scale-110"
                      style={{ background: a.value }}
                    >
                      {prefs.accentColor === a.value && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-2.5">
                  Saved with your account — theming the whole app to this color is a bigger visual pass, coming later.
                </p>
              </div>
            </SectionCard>

            {/* Billing */}
            <SectionCard
              id="billing"
              icon={CreditCard}
              title="Billing"
              description={
                user?.subscription?.plan === "pro"
                  ? "You're on the Pro plan."
                  : "Upgrade for higher AI Tutor limits and more."
              }
              sectionRef={setSectionRef("billing")}
            >
              {user?.subscription?.plan === "pro" ? (
                <div className="flex items-center justify-between rounded-xl border border-purple-400/25 bg-purple-500/[0.06] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-400/30 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Pro plan</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {user.subscription.cancelAtPeriodEnd
                          ? `Cancels on ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}`
                          : user.subscription.currentPeriodEnd
                          ? `Renews ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}`
                          : "Active"}
                      </p>
                    </div>
                  </div>
                  {user.subscription.cancelAtPeriodEnd ? (
                    <span className="text-xs font-medium text-amber-300/80 px-3">
                      Ending soon
                    </span>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={portalLoading}
                      className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {portalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Cancel Subscription
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1 gap-1 mb-5">
                    {[
                      { value: "monthly", label: "Monthly" },
                      { value: "yearly", label: "Yearly — save more" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setBillingInterval(opt.value)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm transition-colors ${
                          billingInterval === opt.value
                            ? "bg-purple-500 text-white"
                            : "text-white/55 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-purple-400/20 bg-purple-500/[0.04] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-400/25 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Upgrade to Pro</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          Higher daily AI Tutor limit, unlimited flashcard decks
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleUpgrade}
                      disabled={checkoutLoading}
                      className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-purple-900/30 flex items-center gap-2 flex-shrink-0"
                    >
                      {checkoutLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {checkoutLoading ? "Redirecting…" : "Upgrade"}
                    </button>
                  </div>
                </>
              )}
            </SectionCard>

            {/* Study Preferences */}
            <SectionCard
              id="study"
              icon={BookOpen}
              title="Study Preferences"
              description="Your daily and weekly targets."
              sectionRef={setSectionRef("study")}
            >
              <div className="grid gap-6 sm:grid-cols-3">
                <NumberField label="Daily Study Goal (hrs)" value={prefs.dailyStudyGoalHours} onChange={(v) => savePrefs({ dailyStudyGoalHours: v })} />
                <NumberField label="Flashcards / Session" value={prefs.cardsPerSession} onChange={(v) => savePrefs({ cardsPerSession: v })} />
                <NumberField label="Weekly Goal (hrs)" value={prefs.weeklyStudyGoalHours} onChange={(v) => savePrefs({ weeklyStudyGoalHours: v })} />
              </div>
            </SectionCard>

            {/* Focus & Pomodoro */}
            <SectionCard
              id="focus"
              icon={Timer}
              title="Focus & Pomodoro"
              description="These durations are what your actual Pomodoro timer uses by default."
              sectionRef={setSectionRef("focus")}
            >
              <div className="grid gap-7 sm:grid-cols-3">
                <SliderField label="Pomodoro Duration" value={prefs.pomodoroMinutes} onChange={(v) => savePrefs({ pomodoroMinutes: v })} min={10} max={60} unit=" min" />
                <SliderField label="Short Break" value={prefs.shortBreakMinutes} onChange={(v) => savePrefs({ shortBreakMinutes: v })} min={1} max={15} unit=" min" />
                <SliderField label="Long Break" value={prefs.longBreakMinutes} onChange={(v) => savePrefs({ longBreakMinutes: v })} min={5} max={30} unit=" min" />
              </div>

              <div className="flex items-center justify-between mt-7 pt-6 border-t border-white/10">
                <div>
                  <p className="text-sm text-white">Auto-start breaks</p>
                  <p className="text-xs text-white/40 mt-0.5">Saved, but the timer doesn't act on this automatically yet.</p>
                </div>
                <Toggle checked={prefs.autoStartBreaks} onChange={(v) => savePrefs({ autoStartBreaks: v })} />
              </div>
            </SectionCard>

            {/* Notifications */}
            <SectionCard
              id="notifications"
              icon={Bell}
              title="Notifications"
              description="These preferences are saved, but no email/push delivery system exists yet — nothing will actually be sent until that's built."
              sectionRef={setSectionRef("notifications")}
            >
              <div className="space-y-1">
                {[
                  ["studyReminders", "Study reminders"],
                  ["flashcardReminders", "Flashcard reminders"],
                  ["deadlineReminders", "Deadline reminders"],
                  ["weeklyReports", "Weekly reports"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white/80">{label}</span>
                    <Toggle
                      checked={prefs.notifications[key]}
                      onChange={(v) => savePrefs({ notifications: { ...prefs.notifications, [key]: v } })}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Data & Backup */}
            <SectionCard
              id="data"
              icon={Database}
              title="Data & Backup"
              description="Export a real copy of everything you've created in StudyOS."
              sectionRef={setSectionRef("data")}
            >
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 py-3 text-sm font-medium transition-colors shadow-lg shadow-purple-900/30"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {exporting ? "Preparing…" : "Export Data"}
                </button>
              </div>
              <p className="text-xs text-white/30 mt-3">
                Downloads a JSON file with your subjects, notes, flashcards, tasks, focus sessions, and badges.
              </p>
            </SectionCard>

            {/* Integrations */}
            <SectionCard
              id="integrations"
              icon={Cloud}
              title="Integrations"
              description="Not built yet — no OAuth connections exist for these services."
              sectionRef={setSectionRef("integrations")}
            >
              <div className="space-y-1">
                {[
                  { name: "Google Drive", detail: "Sync notes & flashcard backups", icon: Cloud },
                  { name: "GitHub", detail: "Import code snippets into notes", icon: GitBranch },
                ].map(({ name, detail, icon: Icon }) => (
                  <div key={name} className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-white">{name}</p>
                        <p className="text-xs text-white/40">{detail}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-white/10 text-white/30">
                      Not available
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Security */}
            <SectionCard
              id="security"
              icon={Shield}
              title="Security"
              description="These aren't built as real features yet — shown honestly disabled rather than faked."
              sectionRef={setSectionRef("security")}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between py-3.5 border-b border-white/5 opacity-40">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white">Change Password</span>
                  </div>
                  <span className="text-xs text-white/40">Coming soon</span>
                </div>
                <div className="flex items-center justify-between py-3.5 border-b border-white/5 opacity-40">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white">Two-Factor Authentication</span>
                  </div>
                  <span className="text-xs text-white/40">Coming soon</span>
                </div>
                <button
                  onClick={async () => { await logout(); navigate("/login"); }}
                  className="w-full flex items-center justify-between py-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white">Log out</span>
                  </div>
                </button>
              </div>
            </SectionCard>

            {/* Danger Zone */}
            <SectionCard
              id="danger"
              icon={Trash2}
              title="Danger Zone"
              description="This action is permanent and genuinely deletes everything — not a placeholder."
              tone="danger"
              sectionRef={setSectionRef("danger")}
            >
              <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4">
                <div>
                  <p className="text-sm text-white font-medium">Delete Account</p>
                  <p className="text-xs text-white/40 mt-0.5">Permanently erase your notes, flashcards, tasks, and progress.</p>
                </div>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="rounded-xl bg-red-500/90 hover:bg-red-500 px-4 py-2.5 text-sm font-semibold transition-colors flex-shrink-0"
                >
                  Delete Account
                </button>
              </div>
            </SectionCard>

            <div className="h-[60vh]" />
          </div>
        </div>
      </div>

      {toast && (
        <div className="settings-toast fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-full bg-[#15111c] border border-white/10 px-4 py-2.5 text-sm shadow-2xl shadow-black/50">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="settings-modal-in w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#15111c] p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Delete your account?</h3>
            <p className="text-sm text-white/50 mt-1.5">
              This permanently deletes all notes, flashcards, tasks, focus history, and badges. This cannot be undone.
            </p>
            <p className="text-xs text-white/40 mt-4 mb-1.5">
              Type <span className="text-white font-mono">DELETE</span> to confirm
            </p>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-red-400/50"
              placeholder="DELETE"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setDeleteOpen(false); setDeleteConfirmText(""); }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmText !== "DELETE" || deleting}
                onClick={handleDeleteAccount}
                className="flex-1 rounded-xl bg-red-500/90 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-500/90 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {deleting ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}