// src/pages/AiTutor.jsx
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Send,
  BookOpen,
  Target,
  Zap,
  User,
  Plus,
  FileUp,
  Layers,
  Wand2,
  Globe,
  X,
  Paperclip,
  HelpCircle,
  Bell,
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { api } from "../lib/api";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AiTutor() {
  const { dashboardData } = useDashboardData();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [usage, setUsage] = useState(null); // { allowed, remaining, limit }
  const [errorBanner, setErrorBanner] = useState("");

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachMenuRef = useRef(null);

  // Fetch real usage on mount so the composer can be disabled up front
  // if the person already hit today's limit, instead of only finding
  // out after a failed send.
  useEffect(() => {
    let cancelled = false;
    async function loadUsage() {
      try {
        const { data } = await api.get("/ai-tutor/usage");
        if (!cancelled) setUsage(data);
      } catch {
        // non-fatal — worst case the limit is only enforced on send
      }
    }
    loadUsage();
    return () => {
      cancelled = true;
    };
  }, []);

  // Suggestion chips still come from the dashboard hook (real data) —
  // only the chat reply itself was ever mocked.
  const suggestions = useMemo(() => {
    if (!dashboardData?.subjects?.length) return [];

    const weakest = [...dashboardData.subjects]
      .sort((a, b) => a.masteryPct - b.masteryPct)
      .slice(0, 2);

    const chips = weakest.map((s) => ({
      icon: Target,
      label: `Help me improve ${s.name} (currently ${s.masteryPct}%)`,
    }));

    const mostDue = [...dashboardData.subjects].sort(
      (a, b) => b.dueCards - a.dueCards,
    )[0];
    if (mostDue?.dueCards > 0) {
      chips.push({
        icon: Zap,
        label: `Quiz me on ${mostDue.name} — I have ${mostDue.dueCards} cards due`,
      });
    }

    return chips.slice(0, 3);
  }, [dashboardData]);

  const attachOptions = [
    {
      icon: FileUp,
      label: "Upload notes or PDF",
      hint: "PDF, DOCX, TXT",
      action: () => fileInputRef.current?.click(),
    },
    {
      icon: Layers,
      label: "Reference a flashcard deck",
      hint: "From your decks",
      action: () => sendMessage("Can you quiz me using my flashcard decks?"),
    },
    {
      icon: Wand2,
      label: "Generate a quiz",
      hint: "AI-generated",
      action: () => sendMessage("Generate a quiz on my weakest subject."),
    },
    {
      icon: Globe,
      label: "Look up a concept",
      hint: "Web search",
      action: () => sendMessage("Look up and explain a concept for me."),
    },
  ];

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setAttachedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  }

  function removeAttachedFile(idx) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  useEffect(() => {
    function handleClick(e) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setAttachMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    autoGrow();
  }, [input, autoGrow]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    const fileNote = attachedFiles.length
      ? `\n📎 ${attachedFiles.map((f) => f.name).join(", ")}`
      : "";
    if (!trimmed && !fileNote) return;
    if (isSending) return;
    if (usage && usage.allowed === false) return; // composer should already be disabled, but guard anyway

    setErrorBanner("");

    const nextMessages = [
      ...messages,
      { role: "user", content: `${trimmed}${fileNote}` },
    ];
    setMessages(nextMessages);
    setInput("");
    setAttachedFiles([]);
    setIsSending(true);
    requestAnimationFrame(autoGrow);

    try {
      // Backend builds real context (subjects, due cards, deadlines) from
      // the database itself — we only send the message history, not a
      // client-built context object.
      const { data } = await api.post("/ai-tutor/chat", {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setUsage((prev) => ({
        ...prev,
        allowed: data.usage.remaining > 0,
        remaining: data.usage.remaining,
        limit: data.usage.limit,
      }));
    } catch (err) {
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.error ||
        "AI Tutor is temporarily unavailable. Please try again.";

      if (code === "DAILY_LIMIT_REACHED" || code === "UPGRADE_REQUIRED") {
        setUsage((prev) => ({ ...prev, allowed: false }));
      }
      setErrorBanner(message);
      // Roll back the optimistic user message's "sent" state by leaving it
      // in place (so they don't lose what they typed) but show the error
      // banner rather than a fake assistant reply.
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const limitReached = usage?.allowed === false;

  return (
    <div className="relative flex flex-col h-[calc(100vh-2rem)] w-full overflow-hidden">
      {/* Local keyframes — scoped, no tailwind.config changes needed */}
      <style>{`
        @keyframes tutorFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tutorPulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.35); }
          50% { box-shadow: 0 0 0 8px rgba(168, 85, 247, 0); }
        }
        @keyframes tutorShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes tutorFloatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.08); }
        }
        @keyframes tutorFloatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 25px) scale(1.05); }
        }
        @keyframes tutorFloatC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 20px) scale(1.1); }
        }
        @keyframes tutorBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes tutorMenuIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tutor-fade-up { animation: tutorFadeUp 0.35s ease-out both; }
        .tutor-pulse { animation: tutorPulseRing 2.4s ease-in-out infinite; }
        .tutor-menu-in { animation: tutorMenuIn 0.15s ease-out both; }
        .tutor-shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #d8b4fe 25%, #fff 50%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: tutorShimmer 5s linear infinite;
        }
        .tutor-blob-a { animation: tutorFloatA 14s ease-in-out infinite; }
        .tutor-blob-b { animation: tutorFloatB 18s ease-in-out infinite; }
        .tutor-blob-c { animation: tutorFloatC 16s ease-in-out infinite; }
        .tutor-dot { animation: tutorBounce 1.2s ease-in-out infinite; }

        .tutor-composer-glow {
          position: absolute;
          inset: -3px;
          border-radius: 1.1rem;
          background: linear-gradient(135deg, #a855f7, #d946ef, #38bdf8, #a855f7);
          background-size: 300% 300%;
          opacity: 0;
          filter: blur(10px);
          transition: opacity 0.35s ease;
          z-index: 0;
        }
        .tutor-composer:hover .tutor-composer-glow,
        .tutor-composer:focus-within .tutor-composer-glow {
          opacity: 0.55;
          animation: tutorShimmer 4s linear infinite;
          background-size: 300% 300%;
        }
        .tutor-composer:focus-within .tutor-composer-glow { opacity: 0.85; }
        .tutor-composer-inner {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .tutor-composer:hover .tutor-composer-inner {
          transform: translateY(-1px) scale(1.008);
          border-color: rgba(216, 180, 254, 0.35);
        }
        .tutor-composer:focus-within .tutor-composer-inner {
          transform: translateY(-1px) scale(1.012);
          border-color: rgba(216, 180, 254, 0.55);
          box-shadow: 0 12px 40px -12px rgba(168, 85, 247, 0.45);
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.12), transparent 60%)",
          }}
        />
        <div className="tutor-blob-a absolute -top-24 -right-20 w-104 h-104 rounded-full bg-purple-600/30 blur-[100px]" />
        <div className="tutor-blob-b absolute -bottom-20 -left-16 w-[24rem] h-96 rounded-full bg-fuchsia-500/20 blur-[100px]" />
        <div className="tutor-blob-c absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-[110px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-purple-400/20 bg-linear-to-br from-purple-500/8 via-white/2 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/30 tutor-pulse">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">
                StudyOS AI
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-purple-400/80 uppercase mt-0.5">
                Your personalized ai assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {usage && (
              <span className="text-xs text-white/40">
                {usage.remaining}/{usage.limit} messages left today
              </span>
            )}
            <button
              type="button"
              title="Help"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Notifications"
              className="relative w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
            </button>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center ring-1 ring-white/20">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4 min-h-full flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <div className="absolute inset-0 rounded-2xl bg-purple-500/10 blur-xl" />
                <BookOpen className="relative w-7 h-7 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  What are we studying today?
                </p>
                <p className="text-sm text-white/50 mt-1">
                  Ask a question, attach a file, or pick a suggestion below.
                </p>
              </div>

              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-2">
                  {suggestions.map(({ icon: Icon, label }, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(label)}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className="tutor-fade-up flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 backdrop-blur-sm hover:bg-purple-500/10 hover:border-purple-400/40 hover:text-white hover:-translate-y-0.5 transition-all"
                    >
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{ animationDelay: `${Math.min(i, 4) * 40}ms` }}
              className={`tutor-fade-up flex items-end gap-2 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0 shadow-md shadow-purple-900/30">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  m.role === "user"
                    ? "bg-linear-to-br from-purple-600 to-purple-700 text-white rounded-br-md"
                    : "bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-white/70" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="tutor-fade-up flex items-end gap-2 justify-start">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0 shadow-md shadow-purple-900/30">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 tutor-dot" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 tutor-dot" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 tutor-dot" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="relative z-10 border-t border-white/10 bg-linear-to-t from-white/3 to-transparent">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {errorBanner && (
            <div className="mb-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {errorBanner}
            </div>
          )}

          {limitReached && !errorBanner && (
            <div className="mb-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-300">
              You've reached today's AI Tutor limit. It resets at midnight
              {usage?.limit ? ` (${usage.limit}/day on your current plan)` : ""}.
            </div>
          )}

          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {attachedFiles.map((f, i) => (
                <div
                  key={i}
                  className="tutor-fade-up flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg pl-2.5 pr-1.5 py-1.5 text-xs text-white/80"
                >
                  <Paperclip className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="max-w-35 truncate">{f.name}</span>
                  <span className="text-white/40">{formatBytes(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(i)}
                    className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="tutor-composer relative">
            <div className="tutor-composer-glow" />

            <div className="tutor-composer-inner relative z-1 flex items-end gap-2 bg-[#120f17]/95 border border-white/10 rounded-2xl px-2 py-2">
              <div className="relative" ref={attachMenuRef}>
                <button
                  type="button"
                  onClick={() => setAttachMenuOpen((v) => !v)}
                  disabled={limitReached}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    attachMenuOpen
                      ? "bg-purple-500/20 text-purple-300 rotate-45"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>

                {attachMenuOpen && (
                  <div className="tutor-menu-in absolute bottom-full mb-2 left-0 w-64 rounded-xl bg-[#15111c] border border-white/10 shadow-2xl shadow-black/50 p-1.5 z-20">
                    {attachOptions.map(({ icon: Icon, label, hint, action }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setAttachMenuOpen(false);
                          action();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="flex-1">{label}</span>
                        <span className="text-xs text-white/40">{hint}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept=".pdf,.doc,.docx,.txt,image/*"
                onChange={handleFileSelect}
              />

              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={limitReached}
                placeholder={
                  limitReached
                    ? "Daily message limit reached — resets at midnight"
                    : "Ask about a topic, or type 'quiz me on DBMS'..."
                }
                className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder-white/40 focus:outline-none max-h-40 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={isSending || limitReached || (!input.trim() && attachedFiles.length === 0)}
                className="w-9 h-9 rounded-xl bg-linear-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 disabled:opacity-40 disabled:hover:from-purple-500 disabled:hover:to-purple-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/30 shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}