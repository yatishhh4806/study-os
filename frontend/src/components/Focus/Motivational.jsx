import { useState, useEffect } from "react";
import { Quote, RefreshCw } from "lucide-react";

const QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
];

function pickRandomIndex(excludeIndex) {
  let i = Math.floor(Math.random() * QUOTES.length);
  while (i === excludeIndex && QUOTES.length > 1) {
    i = Math.floor(Math.random() * QUOTES.length);
  }
  return i;
}

export default function MotivationStrip() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [fading, setFading] = useState(false);

  const accent = "#a855f7";
  const glow = "rgba(168,85,247,0.45)";

  const refresh = () => {
    setFading(true);
    setTimeout(() => {
      setIndex((prev) => pickRandomIndex(prev));
      setFading(false);
    }, 220);
  };

  useEffect(() => {
    const id = setInterval(refresh, 45000);
    return () => clearInterval(id);
  }, []);

  const quote = QUOTES[index];

  return (
    <div
      className="w-full rounded-2xl border border-purple-500/15 border-t-2 border-t-purple-500 bg-gradient-to-r from-[#140e1c]/85 to-[#08060c]/90 backdrop-blur-2xl p-5 md:p-6 flex items-center gap-4 md:gap-5 select-none"
      style={{
        boxShadow: `0 20px 50px -30px rgba(0,0,0,0.6), 0 0 50px -28px ${glow}, 0 -10px 40px -20px ${glow}`,
      }}
    >
      <style>{`
        @keyframes mq-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .mq-text { animation: mq-fadeIn 0.3s ease both; }
      `}</style>

      <Quote size={20} color={accent} className="shrink-0 opacity-80" />

      <div
        className="mq-text flex-1 min-w-0 transition-opacity duration-200"
        key={index}
        style={{
          opacity: fading ? 0 : 1,
        }}
      >
        <p className="text-sm md:text-[15px] font-semibold text-white/90 leading-relaxed m-0">
          {quote.text}
        </p>
        <span className="text-xs font-bold text-purple-400 mt-1 block">— {quote.author}</span>
      </div>

      <button
        onClick={refresh}
        className="shrink-0 w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 flex items-center justify-center cursor-pointer transition hover:rotate-45 hover:border-purple-500/40 hover:text-white/80 active:scale-95 duration-200"
        aria-label="Get another quote"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
}