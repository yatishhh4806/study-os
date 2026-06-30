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

  // rotate automatically every 45s so it stays alive without needing a click
  useEffect(() => {
    const id = setInterval(refresh, 45000);
    return () => clearInterval(id);
  }, []);

  const quote = QUOTES[index];

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 20,
        border: "1px solid rgba(168,85,247,0.18)",
        borderTop: `2px solid ${accent}`,
        background: "linear-gradient(120deg, rgba(20,14,28,0.85), rgba(8,6,12,0.9))",
        backdropFilter: "blur(20px)",
        boxShadow: `0 20px 50px -30px rgba(0,0,0,0.6), 0 0 50px -28px ${glow}, 0 -10px 40px -20px ${glow}`,
        padding: "22px 28px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @keyframes mq-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .mq-text { animation: mq-fadeIn 0.3s ease both; }
        .mq-refresh { transition: all 0.2s ease; }
        .mq-refresh:hover { transform: rotate(45deg); border-color: rgba(168,85,247,0.45) !important; }
      `}</style>

      <Quote size={22} color={accent} style={{ flexShrink: 0, opacity: 0.8 }} />

      <div
        className="mq-text"
        key={index}
        style={{
          flex: 1,
          minWidth: 0,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <p
          style={{
            fontSize: 15.5,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {quote.text}
        </p>
        <span style={{ fontSize: 13, color: accent, fontWeight: 600 }}>— {quote.author}</span>
      </div>

      <button
        onClick={refresh}
        className="mq-refresh"
        aria-label="Get another quote"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <RefreshCw size={15} />
      </button>
    </div>
  );
}