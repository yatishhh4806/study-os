// src/pages/Settings.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Palette,
  BookOpen,
  Bell,
  Database,
  Cloud,
  Shield,
  Trash2,
  Download,
  Upload,
  Timer,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertTriangle,
  KeyRound,
  Smartphone,
  LogOut,
  RotateCcw,
  GitBranch,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TEMPORARY: settings live in local state. SWAP POINT — once the
// backend exists, replace the useState initial values with a fetch
// on mount, and push each change to PATCH /api/settings instead of
// only calling flashSaved(). The UI/interaction layer doesn't change.
// ─────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "appearance",    label: "Appearance",        icon: Palette },
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
        onChange={(e) => onChange(e.target.value)}
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
  // appearance
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [density, setDensity] = useState("comfortable");

  // study
  const [studyGoal, setStudyGoal] = useState(4);
  const [cardsPerSession, setCardsPerSession] = useState(20);
  const [weeklyGoal, setWeeklyGoal] = useState(30);

  // focus
  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);

  // notifications
  const [notifs, setNotifs] = useState({
    "Study reminders": true,
    "Flashcard reminders": true,
    "Deadline reminders": true,
    "Weekly reports": false,
  });

  // security
  const [twoFactor, setTwoFactor] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);

  // danger zone modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const flashSaved = useCallback((msg = "Saved") => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // active nav highlight on scroll
  const [activeSection, setActiveSection] = useState(NAV_SECTIONS[0].id);
  const sectionRefs = useRef({});
  const scrollAreaRef = useRef(null);

  // stable ref-callback factory — avoids re-creating a new inline
  // function per render, which can otherwise leave a stale null
  // in sectionRefs right when a click happens (React StrictMode
  // double-invokes ref callbacks with null in between renders).
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
      // if we're at (or very near) the bottom of the scroll area,
      // force-activate the last section. Without this, a section
      // near the end of the page may never be able to physically
      // scroll up to the "closest to top" comparison point below,
      // so it would never register as active/clickable-looking.
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

  // wrap a setter so every change flashes the "saved" toast, like
  // an app that autosaves — mirrors the pattern most modern edtech
  // settings pages (Duolingo, Coursera, Khan Academy) use instead
  // of an explicit "Save changes" button.
  const withSave = (setter) => (val) => {
    setter(val);
    flashSaved();
  };

  return (
    <div className="relative min-h-screen bg-[#09070f] text-white overflow-hidden">
      <style>{`
        @keyframes settingsToastIn {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes settingsFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes settingsModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .settings-toast { animation: settingsToastIn 0.25s ease-out both; }
        .settings-fade-up { animation: settingsFadeUp 0.35s ease-out both; }
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

      {/* ambient glow, consistent with the rest of StudyOS */}
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
        {/* min-w-0 lets this flex child shrink to fit instead of
            forcing the page wider than the viewport. */}
        <div ref={scrollAreaRef} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-3xl mx-auto px-6 py-8 lg:py-10 space-y-6">
            {/* mobile header (left nav is hidden below lg breakpoint) */}
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
                    value={theme}
                    onChange={withSave(setTheme)}
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
                    value={density}
                    onChange={withSave(setDensity)}
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
                      onClick={() => withSave(setAccent)(a.value)}
                      className="relative w-9 h-9 rounded-full transition-transform hover:scale-110"
                      style={{ background: a.value }}
                    >
                      {accent === a.value && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
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
                <NumberField label="Daily Study Goal (hrs)" value={studyGoal} onChange={withSave(setStudyGoal)} />
                <NumberField label="Flashcards / Session" value={cardsPerSession} onChange={withSave(setCardsPerSession)} />
                <NumberField label="Weekly Goal (hrs)" value={weeklyGoal} onChange={withSave(setWeeklyGoal)} />
              </div>
            </SectionCard>

            {/* Focus & Pomodoro */}
            <SectionCard
              id="focus"
              icon={Timer}
              title="Focus & Pomodoro"
              description="Timer lengths for focus sessions."
              sectionRef={setSectionRef("focus")}
            >
              <div className="grid gap-7 sm:grid-cols-3">
                <SliderField label="Pomodoro Duration" value={pomodoro} onChange={withSave(setPomodoro)} min={10} max={60} unit=" min" />
                <SliderField label="Short Break" value={shortBreak} onChange={withSave(setShortBreak)} min={1} max={15} unit=" min" />
                <SliderField label="Long Break" value={longBreak} onChange={withSave(setLongBreak)} min={5} max={30} unit=" min" />
              </div>

              <div className="flex items-center justify-between mt-7 pt-6 border-t border-white/10">
                <div>
                  <p className="text-sm text-white">Auto-start breaks</p>
                  <p className="text-xs text-white/40 mt-0.5">Skip the manual "start break" tap between sessions.</p>
                </div>
                <Toggle checked={autoStartBreaks} onChange={withSave(setAutoStartBreaks)} />
              </div>
            </SectionCard>

            {/* Notifications */}
            <SectionCard
              id="notifications"
              icon={Bell}
              title="Notifications"
              description="Choose what StudyOS should remind you about."
              sectionRef={setSectionRef("notifications")}
            >
              <div className="space-y-1">
                {Object.entries(notifs).map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white/80">{label}</span>
                    <Toggle
                      checked={val}
                      onChange={withSave((next) => setNotifs((prev) => ({ ...prev, [label]: next })))}
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
              description="Export your notes and progress, or restore from a backup."
              sectionRef={setSectionRef("data")}
            >
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => flashSaved("Preparing export…")}
                  className="flex items-center gap-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-3 text-sm font-medium transition-colors shadow-lg shadow-purple-900/30"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={() => flashSaved("Select a backup file to import")}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import Backup
                </button>
                <button
                  onClick={() => flashSaved("Cache cleared")}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Local Cache
                </button>
              </div>
            </SectionCard>

            {/* Integrations */}
            <SectionCard
              id="integrations"
              icon={Cloud}
              title="Integrations"
              description="Services connected to your StudyOS account."
              sectionRef={setSectionRef("integrations")}
            >
              <div className="space-y-1">
                {[
                  { name: "Google Drive", detail: "Sync notes & flashcard backups", icon: Cloud, connected: true },
                  { name: "GitHub", detail: "Import code snippets into notes", icon: GitBranch, connected: false },
                ].map(({ name, detail, icon: Icon, connected }) => (
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
                    <button
                      onClick={() => flashSaved(connected ? `${name} disconnected` : `${name} connected`)}
                      className={`text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-colors ${
                        connected
                          ? "border-emerald-400/30 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15"
                          : "border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {connected ? "Connected" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Security */}
            <SectionCard
              id="security"
              icon={Shield}
              title="Security"
              description="Keep your account locked down."
              sectionRef={setSectionRef("security")}
            >
              <div className="space-y-1">
                <button
                  onClick={() => setChangePwOpen((v) => !v)}
                  className="w-full flex items-center justify-between py-3.5 border-b border-white/5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white">Change Password</span>
                  </div>
                  <span className="text-xs text-white/40">{changePwOpen ? "Close" : "Update"}</span>
                </button>

                {changePwOpen && (
                  <div className="settings-fade-up grid gap-3 sm:grid-cols-3 py-4 border-b border-white/5">
                    <input type="password" placeholder="Current password" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-purple-400/50" />
                    <input type="password" placeholder="New password" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-purple-400/50" />
                    <button
                      onClick={() => { setChangePwOpen(false); flashSaved("Password updated"); }}
                      className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between py-3.5 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-white/50" />
                    <div>
                      <p className="text-sm text-white">Two-Factor Authentication</p>
                      <p className="text-xs text-white/40 mt-0.5">Extra verification step at sign-in.</p>
                    </div>
                  </div>
                  <Toggle checked={twoFactor} onChange={withSave(setTwoFactor)} />
                </div>

                <button
                  onClick={() => flashSaved("Signed out of 1 other session")}
                  className="w-full flex items-center justify-between py-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white">Manage Sessions</span>
                  </div>
                  <span className="text-xs text-white/40">2 active</span>
                </button>
              </div>
            </SectionCard>

            {/* Danger Zone */}
            <SectionCard
              id="danger"
              icon={Trash2}
              title="Danger Zone"
              description="These actions are permanent and cannot be undone."
              tone="danger"
              sectionRef={setSectionRef("danger")}
            >
              <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4">
                <div>
                  <p className="text-sm text-white font-medium">Delete Account</p>
                  <p className="text-xs text-white/40 mt-0.5">Permanently erase your notes, flashcards, and progress.</p>
                </div>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="rounded-xl bg-red-500/90 hover:bg-red-500 px-4 py-2.5 text-sm font-semibold transition-colors flex-shrink-0"
                >
                  Delete Account
                </button>
              </div>
            </SectionCard>

            {/* Bottom scroll headroom — without this, the last one or two
                sections can never be scrolled up to the "active" comparison
                point, since the container simply runs out of room to scroll
                further once they're already near the bottom. */}
            <div className="h-[60vh]" />
          </div>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="settings-toast fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-full bg-[#15111c] border border-white/10 px-4 py-2.5 text-sm shadow-2xl shadow-black/50">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* delete confirmation modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="settings-modal-in w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#15111c] p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Delete your account?</h3>
            <p className="text-sm text-white/50 mt-1.5">
              This permanently deletes all notes, flashcards, and study history. This cannot be undone.
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
                disabled={deleteConfirmText !== "DELETE"}
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteConfirmText("");
                  flashSaved("Account deletion requested");
                }}
                className="flex-1 rounded-xl bg-red-500/90 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-500/90 py-2.5 text-sm font-semibold transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}