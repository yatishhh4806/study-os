// src/pages/AiTutor.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import { Sparkles, Send, BookOpen, Loader2 } from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";

// ─────────────────────────────────────────────────────────────
// TEMPORARY: simulated reply generator, used until the backend
// (server/routes/aiTutor.js) is wired up. It uses the same context
// object the real API call will eventually send, so nothing about
// the component's data flow changes when you connect the backend —
// only sendMessage()'s implementation swaps out.
// ─────────────────────────────────────────────────────────────
function simulateTutorReply(userText, context) {
  const text = userText.toLowerCase();
  const subjects = context.subjects || [];
  const weakest = [...subjects].sort((a, b) => a.mastery - b.mastery)[0];
  const mentioned = subjects.find((s) => text.includes(s.name.toLowerCase()));

  if (mentioned) {
    return `${mentioned.name} is at ${mentioned.mastery}% mastery with ${mentioned.dueCards} cards due. Once the real tutor is connected, I'll actually teach you the concept here — for now this is a placeholder reply so you can test the chat UI.`;
  }

  if (text.includes("quiz")) {
    return `I'd quiz you on ${weakest?.name || "your weakest subject"} here once the backend is live. This is a placeholder response for UI testing.`;
  }

  return `(Simulated reply) Once connected to the backend, I'll answer using your real dashboard data. Right now your weakest subject is ${weakest?.name} at ${weakest?.mastery}%.`;
}

/**
 * Builds the payload that will eventually be sent to the backend.
 * Kept identical to the real integration's shape so swapping
 * simulateTutorReply() for a real fetch() later is a one-line change.
 */
function buildTutorContext(dashboardData) {
  if (!dashboardData) return {};

  const { streak, studyHours, productivity, subjects, deadlines, schedule } =
    dashboardData;

  const dueCardsTotal = (subjects || []).reduce(
    (sum, s) => sum + (s.dueCards || 0),
    0
  );

  return {
    streak,
    studyHours,
    productivity,
    dueCardsTotal,
    subjects: subjects || [],
    deadlines: deadlines || [],
    todaySchedule: schedule || [],
  };
}

export default function AiTutor() {
  const { dashboardData, loading: dashboardLoading } = useDashboardData();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  const context = useMemo(() => buildTutorContext(dashboardData), [dashboardData]);

  const suggestions = useMemo(() => {
    if (!dashboardData?.subjects) return [];

    const weakest = [...dashboardData.subjects]
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 2);

    const chips = weakest.map(
      (s) => `Help me improve ${s.name} (currently ${s.mastery}%)`
    );

    const mostDue = [...dashboardData.subjects].sort(
      (a, b) => b.dueCards - a.dueCards
    )[0];
    if (mostDue?.dueCards > 0) {
      chips.push(`Quiz me on ${mostDue.name} — I have ${mostDue.dueCards} cards due`);
    }

    return chips.slice(0, 3);
  }, [dashboardData]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    // ── SWAP POINT ──────────────────────────────────────────────
    // Replace this block with the real fetch() call once your
    // backend exists:
    //
    //   const res = await fetch("/api/ai-tutor/chat", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ messages: nextMessages, context }),
    //   });
    //   const data = await res.json();
    //   setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    //
    // For now, simulate network latency + a canned reply so the UI
    // is fully testable.
    setTimeout(() => {
      const reply = simulateTutorReply(trimmed, context);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsSending(false);
    }, 700);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">AI Tutor</h1>
          <p className="text-xs text-white/50">
            {dashboardLoading
              ? "Loading your progress..."
              : "Knows your subjects, mastery, and deadlines"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">What are we studying today?</p>
              <p className="text-sm text-white/50 mt-1">
                Ask a question, or pick a suggestion based on your dashboard.
              </p>
            </div>

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-purple-500/10 hover:border-purple-400/40 hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 text-white/50 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 border-t border-white/10 flex items-center gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a topic, or type 'quiz me on DBMS'..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="w-11 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}