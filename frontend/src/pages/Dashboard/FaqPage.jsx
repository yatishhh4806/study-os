import { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Flame,
  LayoutGrid,
  Trophy,
  Brain,
  Timer,
  Bot,
  Shield,
  Sparkles,
} from "lucide-react";

const glass = {
  borderRadius: 20,
  border: "1px solid rgba(168,85,247,.15)",
  background: "linear-gradient(180deg,rgba(18,12,26,.85),rgba(8,6,12,.9))",
  backdropFilter: "blur(20px)",
  boxShadow: "0 20px 50px -20px rgba(0,0,0,.5)",
};

const CATEGORIES = [
  {
    id: "general",
    label: "About StudyOS",
    icon: <Sparkles size={16} />,
    color: "#a855f7",
    faqs: [
      {
        q: "Why StudyOS instead of using separate apps?",
        a: "StudyOS combines notes, planning, flashcards, focus sessions, and AI tutoring into one workspace, so your study data actually talks to each other — a flashcard you struggle with can surface as a planner task, a focus session feeds your streak and heatmap, and your AI tutor can see what you're studying. Juggling five separate apps means none of them know what the others are doing.",
      },
      {
        q: "Is my data private?",
        a: "Your notes, flashcards, and study data are tied to your account and only visible to you. We don't sell study data or share it with third parties.",
      },
      {
        q: "Do I need a Pro subscription to use StudyOS?",
        a: "No — the core features (Notes, Planner, Flashcards, Focus Mode, Dashboard) are free. Pro unlocks additional AI Tutor usage and advanced features.",
      },
    ],
  },
  {
    id: "streaks",
    label: "Streaks & Heatmap",
    icon: <Flame size={16} />,
    color: "#fb923c",
    faqs: [
      {
        q: "How is my streak calculated?",
        a: "Your streak increases by 1 every day you complete at least one full focus session. If you complete a session today after already completing one earlier today, your streak doesn't increase again — it only counts once per calendar day. Miss a full day with no completed session, and your streak resets to 1 the next time you study (not 0 — the day you resume already counts).",
      },
      {
        q: "Why did my streak reset even though I studied yesterday?",
        a: "Streaks are evaluated on calendar days. If you studied very late at night, it's possible that session landed on a different calendar day than you expected, especially close to midnight. This is a known edge case we're refining.",
      },
      {
        q: "What counts as a 'completed' focus session?",
        a: "A focus session counts once the timer runs down to 0:00 without being reset or abandoned. Pausing and resuming is fine — only resetting or switching modes mid-session discards it.",
      },
      {
        q: "How is the Study Heatmap calculated?",
        a: "Each cell represents one day over the last 30 days. Its color intensity is based on total focused minutes that day: no activity is empty, under 30 minutes is the lightest shade, 30–90 minutes is medium, and 90+ minutes is the brightest.",
      },
      {
        q: "What's the difference between Current Streak and Best Streak?",
        a: "Current Streak is your active consecutive-day count right now. Best Streak is the highest it's ever reached — it never decreases, even if your current streak resets.",
      },
    ],
  },
  {
    id: "flashcards",
    label: "Flashcards & Mastery",
    icon: <Brain size={16} />,
    color: "#22d3ee",
    faqs: [
      {
        q: "How is Subject Mastery % calculated?",
        a: "Mastery is based on how many of a subject's flashcards are 'mature' — meaning they've been successfully reviewed 3 or more times in spaced repetition. It's a proxy for how well-learned a subject's material is, not a formal test score.",
      },
      {
        q: "How does spaced repetition decide when a card is due?",
        a: "Cards you answer correctly get scheduled further into the future; cards you get wrong come back sooner. This spaces out review sessions to match how memory naturally fades, so you spend less time on things you already know.",
      },
    ],
  },
  {
    id: "focus",
    label: "Focus Mode",
    icon: <Timer size={16} />,
    color: "#f472b6",
    faqs: [
      {
        q: "Does pausing a focus session affect my stats?",
        a: "Pausing logs a distraction against that session but keeps it alive — resuming continues the same session. Only resetting or abandoning a session discards it entirely, with no stats applied.",
      },
      {
        q: "What's the difference between Focus, Short Break, and Long Break modes?",
        a: "Only Focus sessions count toward your study minutes, streak, and XP. Break modes are for pacing your work using the Pomodoro technique and aren't logged to your stats.",
      },
    ],
  },
  {
    id: "ai",
    label: "AI Tutor",
    icon: <Bot size={16} />,
    color: "#34d399",
    faqs: [
      {
        q: "What can the AI Tutor help with?",
        a: "The AI Tutor can answer questions about your study material, explain concepts, and help you work through problems. It's designed to complement your notes and flashcards, not replace them.",
      },
    ],
  },
  {
    id: "badges",
    label: "Badges & Leaderboard",
    icon: <Trophy size={16} />,
    color: "#facc15",
    faqs: [
      {
        q: "How are badges earned?",
        a: "Badges are earned automatically as you hit milestones — things like streak length, total sessions completed, or subject mastery thresholds. Check the Badges page to see progress toward ones you haven't unlocked yet.",
      },
      {
        q: "How is Weekly XP calculated?",
        a: "You earn 1 XP per minute of completed focus time, plus a small bonus for finishing a full Pomodoro session. It resets at the start of each week and feeds the Leaderboard.",
      },
    ],
  },
];

function FaqItem({ faq, isOpen, onToggle, accent }) {
  return (
    <div
      onClick={onToggle}
      style={{
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 14,
        background: isOpen ? `${accent}0a` : "rgba(255,255,255,.02)",
        marginBottom: 10,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,.9)",
            lineHeight: 1.4,
          }}
        >
          {faq.q}
        </span>
        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: isOpen ? accent : "rgba(255,255,255,.35)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .25s ease",
          }}
        />
      </div>
      <div
        style={{
          maxHeight: isOpen ? 300 : 0,
          transition: "max-height .3s ease",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            margin: 0,
            padding: "0 18px 16px",
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "rgba(255,255,255,.55)",
          }}
        >
          {faq.a}
        </p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter((f) => {
        const matchesCategory = activeCategory === "all" || activeCategory === cat.id;
        const matchesQuery =
          !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      }),
    })).filter((cat) => cat.faqs.length > 0);
  }, [query, activeCategory]);

  const totalResults = filtered.reduce((sum, c) => sum + c.faqs.length, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 40% at 80% -5%,rgba(168,85,247,.1),transparent 55%),#050308",
        padding: "28px 32px 60px",
        fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          ...glass,
          border: "1px solid rgba(168,85,247,.2)",
          padding: "clamp(24px,4vh,36px) clamp(24px,3vw,36px)",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(168,85,247,.12),transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <HelpCircle size={18} color="#a855f7" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#a855f7", letterSpacing: 0.3 }}>
            HELP CENTER
          </span>
        </div>
        <h1
          style={{
            position: "relative",
            fontSize: "clamp(28px,4vh,38px)",
            fontWeight: 900,
            margin: 0,
            letterSpacing: -1,
            background: "linear-gradient(135deg,#fff 40%,#c4b5fd)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Frequently Asked Questions
        </h1>
        <p style={{ position: "relative", marginTop: 8, fontSize: 14.5, color: "rgba(255,255,255,.45)", maxWidth: 560 }}>
          Everything about how StudyOS works — streaks, heatmaps, mastery, and more.
        </p>

        {/* Search */}
        <div style={{ position: "relative", marginTop: 24, maxWidth: 480 }}>
          <Search
            size={17}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,.3)",
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs..."
            style={{
              width: "100%",
              padding: "13px 16px 13px 44px",
              borderRadius: 14,
              border: "1px solid rgba(168,85,247,.2)",
              background: "rgba(255,255,255,.03)",
              color: "#fff",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setActiveCategory("all")}
          style={{
            padding: "8px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.1)",
            background: activeCategory === "all" ? "rgba(168,85,247,.18)" : "rgba(255,255,255,.03)",
            color: activeCategory === "all" ? "#fff" : "rgba(255,255,255,.55)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all .15s",
          }}
        >
          All Topics
        </button>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 12,
                border: `1px solid ${active ? cat.color + "55" : "rgba(255,255,255,.1)"}`,
                background: active ? `${cat.color}18` : "rgba(255,255,255,.03)",
                color: active ? "#fff" : "rgba(255,255,255,.55)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <span style={{ color: cat.color }}>{cat.icon}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {totalResults === 0 ? (
        <div style={{ ...glass, padding: "40px 24px", textAlign: "center" }}>
          <Shield size={24} color="rgba(255,255,255,.2)" style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", margin: 0 }}>
            No FAQs match "{query}". Try a different search.
          </p>
        </div>
      ) : (
        filtered.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: cat.color }}>{cat.icon}</span>
              <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "rgba(255,255,255,.8)" }}>
                {cat.label}
              </h2>
            </div>
            <div style={{ ...glass, padding: "10px 14px" }}>
              {cat.faqs.map((faq, i) => {
                const id = `${cat.id}-${i}`;
                return (
                  <FaqItem
                    key={id}
                    faq={faq}
                    accent={cat.color}
                    isOpen={openId === id}
                    onToggle={() => setOpenId(openId === id ? null : id)}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}