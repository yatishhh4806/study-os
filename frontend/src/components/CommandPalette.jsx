// src/components/CommandPalette.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  BookOpen,
  Calendar,
  Brain,
  Sparkles,
  Library,
  Settings as SettingsIcon,
  FilePlus,
  Layers,
  Timer,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  User,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Matches the real routes in App.jsx (everything lives under
// /dashboard/...). Update here if routes ever move.
// ─────────────────────────────────────────────────────────────
const NAV_COMMANDS = [
  {
    id: "nav-dashboard",
    label: "Dashboard",
    hint: "Overview & streak",
    icon: LayoutGrid,
    to: "/dashboard",
  },
  {
    id: "nav-notes",
    label: "Notes",
    hint: "Notion-style notes",
    icon: BookOpen,
    to: "/dashboard/notes",
  },
  {
    id: "nav-planner",
    label: "Planner",
    hint: "Calendar & tasks",
    icon: Calendar,
    to: "/dashboard/planner",
  },
  {
    id: "nav-flashcards",
    label: "Flashcards",
    hint: "Spaced repetition",
    icon: Brain,
    to: "/dashboard/flashcards",
  },
  {
    id: "nav-focus",
    label: "Focus",
    hint: "Pomodoro timer",
    icon: Timer,
    to: "/dashboard/focus",
  },
  {
    id: "nav-ai-tutor",
    label: "AI Tutor",
    hint: "Ask a question",
    icon: Sparkles,
    to: "/dashboard/ai-tutor",
  },
  {
    id: "nav-resources",
    label: "Resources",
    hint: "Saved materials",
    icon: Library,
    to: "/dashboard/resources",
  },
  {
    id: "nav-profile",
    label: "Profile",
    hint: "Your account",
    icon: User,
    to: "/dashboard/profile",
  },
  {
    id: "nav-settings",
    label: "Settings",
    hint: "Preferences",
    icon: SettingsIcon,
    to: "/dashboard/settings",
  },
];

const ACTION_COMMANDS = [
  {
    id: "action-new-note",
    label: "New Note",
    hint: "Create in Notes",
    icon: FilePlus,
    to: "/dashboard/notes",
  },
  {
    id: "action-new-deck",
    label: "New Flashcard Deck",
    hint: "Create in Flashcards",
    icon: Layers,
    to: "/dashboard/flashcards",
  },
  {
    id: "action-focus",
    label: "Start Focus Session",
    hint: "Pomodoro timer",
    icon: Timer,
    to: "/dashboard/focus",
  },
  {
    id: "action-ask-tutor",
    label: "Ask AI Tutor",
    hint: "Open chat",
    icon: Sparkles,
    to: "/dashboard/ai-tutor",
  },
];

const ALL_COMMANDS = [
  ...NAV_COMMANDS.map((c) => ({ ...c, group: "Navigate" })),
  ...ACTION_COMMANDS.map((c) => ({ ...c, group: "Quick actions" })),
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // global Cmd/Ctrl+K toggle, from anywhere in the app
  useEffect(() => {
    function onKeyDown(e) {
      if (!e.key) return; // some autofill/IME-related synthetic events fire without a key
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // reset + autofocus whenever it opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_COMMANDS;
    return ALL_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    );
  }, [query]);

  // grouped for rendering, but flat-indexed for keyboard nav
  const grouped = useMemo(() => {
    const groups = {};
    results.forEach((c, i) => {
      if (!groups[c.group]) groups[c.group] = [];
      groups[c.group].push({ ...c, flatIndex: i });
    });
    return groups;
  }, [results]);

  useEffect(() => setActiveIndex(0), [query]);

  const runCommand = useCallback(
    (cmd) => {
      if (!cmd) return;
      setOpen(false);
      navigate(cmd.to);
    },
    [navigate],
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(results[activeIndex]);
    }
  };

  // keep active item scrolled into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-2000 flex items-start justify-center pt-[12vh] px-4">
      <style>{`
        @keyframes cmdkBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cmdkPanelIn {
          from { opacity: 0; transform: scale(0.97) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .cmdk-backdrop { animation: cmdkBackdropIn 0.15s ease-out both; }
        .cmdk-panel { animation: cmdkPanelIn 0.16s ease-out both; }
      `}</style>

      {/* backdrop */}
      <div
        className="cmdk-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* panel */}
      <div className="cmdk-panel relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#120f17]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, or type a command..."
            className="flex-1 bg-transparent outline-none text-[15px] text-white placeholder-white/35"
          />
          <kbd className="hidden sm:block text-[10px] font-semibold text-white/35 border border-white/10 rounded-md px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* results */}
        <div ref={listRef} className="max-h-90 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-white/35">
              No results for "{query}"
            </p>
          )}

          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-1 last:mb-0">
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/30">
                {group}
              </p>
              {items.map(({ id, label, hint, icon: Icon, flatIndex, to }) => (
                <button
                  key={id}
                  data-index={flatIndex}
                  onMouseEnter={() => setActiveIndex(flatIndex)}
                  onClick={() => runCommand({ to })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    flatIndex === activeIndex
                      ? "bg-purple-500/15 text-white"
                      : "text-white/75 hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                      flatIndex === activeIndex
                        ? "border-purple-400/40 bg-purple-500/10 text-purple-300"
                        : "border-white/10 bg-white/5 text-white/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {label}
                    </span>
                  </span>
                  <span className="text-xs text-white/30 flex-shrink-0">
                    {hint}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* footer hints */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/10 text-[11px] text-white/35">
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" /> Navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" /> Select
          </span>
          <span className="ml-auto hidden sm:flex items-center gap-1">
            <kbd className="border border-white/10 rounded px-1.5 py-0.5 font-semibold">
              ⌘
            </kbd>
            <kbd className="border border-white/10 rounded px-1.5 py-0.5 font-semibold">
              K
            </kbd>
            to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
