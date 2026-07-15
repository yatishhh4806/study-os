import { useState } from "react";
import { Music2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./FocusMusic.css";

export default function FocusMusic({
  connection,
  player,
  playlists,
  ambient,
  footer,
  spotifyActive = false,
  ambientActive = false,
  spotifyConnected = false,
}) {
  const [activeTab, setActiveTab] = useState(spotifyConnected ? "spotify" : "ambient");

  return (
    <section className="focus-music-card flex flex-col gap-6 p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-[#181222]/95 to-[#0a080e]/98 backdrop-blur-2xl shadow-2xl relative overflow-hidden h-full">
      {/* Background Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-violet-300 uppercase mb-2">
            <Music2 size={14} className="text-violet-400" />
            <span>Soundtrack</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
            Soundtrack
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Choose your audio environment for deep study.
          </p>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="relative z-10 flex p-1 rounded-xl bg-white/[0.03] border border-white/5">
        <button
          onClick={() => setActiveTab("spotify")}
          className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "spotify"
              ? "text-white font-bold"
              : "text-white/45 hover:text-white/70"
          }`}
        >
          {activeTab === "spotify" && (
            <motion.div
              layoutId="activeMusicTab"
              className="absolute inset-0 bg-violet-600/20 border border-violet-500/30 rounded-lg"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <Music2 size={16} className="relative z-10" />
          <span className="relative z-10">Spotify</span>
          {spotifyActive && (
            <span className="relative z-10 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ambient")}
          className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "ambient"
              ? "text-white font-bold"
              : "text-white/45 hover:text-white/70"
          }`}
        >
          {activeTab === "ambient" && (
            <motion.div
              layoutId="activeMusicTab"
              className="absolute inset-0 bg-violet-600/20 border border-violet-500/30 rounded-lg"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <Sparkles size={16} className="relative z-10" />
          <span className="relative z-10">Ambient</span>
          {ambientActive && (
            <span className="relative z-10 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {activeTab === "spotify" ? (
            <motion.div
              key="spotify"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-5 w-full"
            >
              {connection}
              {player}
              {playlists}
            </motion.div>
          ) : (
            <motion.div
              key="ambient"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              {ambient}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-auto pt-4 border-t border-white/5">
        {footer}
      </footer>
    </section>
  );
}