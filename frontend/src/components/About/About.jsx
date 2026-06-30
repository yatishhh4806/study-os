import React from "react";
import {
  Check,
  X,
  FileText,
  Calendar,
  Timer,
  Brain,
  Bot,
  Folder,
} from "lucide-react";
import { motion } from "framer-motion";

function About() {
  const normalApps = [
    {
      icon: <FileText size={20} />,
      title: "Google Docs",
      desc: "Notes & lectures",
    },
    {
      icon: <Calendar size={20} />,
      title: "Google Calendar",
      desc: "Scheduling",
    },
    {
      icon: <Timer size={20} />,
      title: "Pomodoro App",
      desc: "Focus sessions",
    },
    {
      icon: <Brain size={20} />,
      title: "Flashcards App",
      desc: "Revision",
    },
    {
      icon: <Bot size={20} />,
      title: "AI Tools",
      desc: "ChatGPT, Gemini",
    },
    {
      icon: <Folder size={20} />,
      title: "Drive Folders",
      desc: "Files & resources",
    },
  ];

  const studyFeatures = [
    "Smart Notes",
    "AI Assistant",
    "Study Planner",
    "Focus Sessions",
    "Flashcards",
    "Analytics",
    "Performance Tracker",
    "Quick Revisions",
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#09070f] px-8 py-8"
    >
      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-24 text-center">
          <h1 className="text-7xl font-black text-white">
            Why
            <span className="text-purple-400"> StudyOS</span>?
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-gray-400">
            Students constantly switch between apps, tabs, folders and AI
            tools. StudyOS brings everything together into one seamless
            academic operating system.
          </p>
        </div>

        {/* Comparison */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* LEFT */}
          <div className="rounded-4xl border border-red-500/20 bg-black/40 p-10 backdrop-blur-xl">
            {/* Header */}
            <div className="mb-10 flex items-center gap-5">
              <div className="rounded-full bg-red-500/20 p-4">
                <X className="text-red-400" size={28} />
              </div>

              <div>
                <h2 className="text-4xl font-bold text-white">
                  Normal Student
                </h2>

                <p className="mt-1 text-gray-400">
                  Multiple Apps. Multiple Distractions.
                </p>
              </div>
            </div>

            {/* Apps */}
            <div className="space-y-0">
              {normalApps.map((app, index) => (
                <div key={app.title}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-5 rounded-2xl border border-white/10 bg-black/50 p-5 transition hover:border-purple-500/20"
                  >
                    <div className="rounded-xl bg-purple-500/20 p-3 text-purple-300">
                      {app.icon}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {app.title}
                      </h3>

                      <p className="text-gray-400">{app.desc}</p>
                    </div>
                  </motion.div>

                  {/* Context Switching Connector */}
                  {index !== normalApps.length - 1 && (
                    <div className="relative flex h-10 justify-center">
                      {/* Arrows */}
                      <div className="absolute flex flex-col items-center leading-none">
                        <span className="mt-1 text text-white">↑</span>
                        <span className="-mt-1 text text-white">↓</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 rounded-2xl bg-red-500/10 p-6">
              <div className="text-center">
                <p className="text-lg text-red-300">✕ Context Switching • ✕ Stress & Disorganization • ✕ Lost Productivity </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-4xl border border-purple-500/20 bg-black/40 p-10 backdrop-blur-xl">
            {/* Header */}
            <div className="mb-10 flex items-center gap-5">
              <div className="rounded-full bg-purple-500/20 p-4">
                <Check className="text-purple-300" size={28} />
              </div>

              <div>
                <h2 className="text-4xl font-bold text-white">StudyOS</h2>

                <p className="mt-1 text-purple-300">
                  Everything Under One Ecosystem
                </p>
              </div>
            </div>

            {/* Glow */}
            <div className="relative flex justify-center">
              <div className="absolute h-112.5 w-112.5 rounded-full bg-purple-500/15 blur-[100px]" />

              {/* Main Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-107.5 rounded-4xl border border-purple-500/20 bg-black/70 p-8 shadow-[0_0_80px_rgba(168,85,247,0.2)] backdrop-blur-xl"
              >
                {/* Logo */}
                <div className="text-center">
                  <h1 className="text-6xl font-black text-white">
                    Study
                    <span className="text-purple-400">OS</span>
                  </h1>

                  <p className="mt-3 text-lg text-gray-400">
                    Your Academic Operating System
                  </p>
                </div>

                {/* Features */}
                <div className="mt-10 space-y-4">
                  {studyFeatures.map((feature) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={feature}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/3 px-5 py-4 transition hover:border-purple-500/30 hover:bg-purple-500/5"
                    >
                      <div className="h-3 w-3 rounded-full bg-purple-400" />
                      <p className="text-lg font-medium text-white">
                        {feature}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-10 rounded-2xl bg-purple-500/10 py-5 text-center">
                  <p className="text-lg text-purple-200">
                    ✓ Unified • ✓ Organized • ✓ Productive
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;