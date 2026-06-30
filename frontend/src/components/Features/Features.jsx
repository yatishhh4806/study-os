import Navbar from "../Layout/Navbar";

function Features() {
  const features = [
    {
      icon: "📝",
      title: "Notes",
      points: [
        "Markdown support",
        "AI summaries",
        "PDF annotation",
        "Cloud sync",
      ],
    },
    {
      icon: "📅",
      title: "Planner",
      points: [
        "Assignment tracking",
        "Exam schedules",
        "Smart reminders",
        "Calendar integration",
      ],
    },
    {
      icon: "⏱",
      title: "Focus",
      points: [
        "Pomodoro timer",
        "Deep work mode",
        "Session analytics",
        "Focus streaks",
      ],
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      points: [
        "Explain concepts",
        "Generate quizzes",
        "Create study plans",
        "Summarize lectures",
      ],
    },
    {
      icon: "📊",
      title: "Analytics",
      points: [
        "Productivity tracking",
        "Study heatmaps",
        "Performance insights",
        "Weekly reports",
      ],
    },
    {
      icon: "🎓",
      title: "Flashcards",
      points: [
        "AI generation",
        "Spaced repetition",
        "Smart revision",
        "Progress tracking",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#09070f]">
      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 z-9999 w-[92%] max-w-7xl -translate-x-1/2">
        <Navbar />
      </nav>

      {/* Hero */}
      <section className="px-8 pb-32 pt-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-6xl font-black text-white">
              <span className="italic">Everything</span> you need
              <br />
              to master learning
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-400">
              StudyOS combines productivity, organization and AI-powered
              learning into one beautiful ecosystem.
            </p>
          </div>

          {/* Grid */}
          <div className="mt-24 grid grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative min-h-105 overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(132,0,255,0.15)]"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(132,0,255,0.15),transparent_60%)] opacity-0 transition duration-500 group-hover:opacity-100" />

                {/* Header */}
                <div className="relative z-10 flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-3xl">
                    {feature.icon}
                  </div>

                  <h2 className="text-3xl font-bold text-white">
                    {feature.title}
                  </h2>
                </div>

                {/* Bullet points */}
                <div className="relative z-10 mt-10 space-y-4">
                  {feature.points.map((point) => (
                    <div key={point} className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-purple-400" />
                      <p className="text-lg text-gray-300">{point}</p>
                    </div>
                  ))}
                </div>

                {/* Mini previews */}
                <div className="relative z-10 mt-10">
                  {feature.title === "Notes" && (
                    <div className="rounded-2xl bg-white/5 p-5">
                      <div className="h-2 w-24 rounded bg-purple-400/70" />
                      <div className="mt-4 h-2 w-full rounded bg-white/10" />
                      <div className="mt-3 h-2 w-4/5 rounded bg-white/10" />
                      <div className="mt-3 h-2 w-2/3 rounded bg-white/10" />
                    </div>
                  )}

                  {feature.title === "Planner" && (
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-lg bg-purple-500/20 px-4 py-2 text-purple-300">
                        DSA
                      </div>
                      <div className="rounded-lg bg-blue-500/20 px-4 py-2 text-blue-300">
                        ML
                      </div>
                      <div className="rounded-lg bg-red-500/20 px-4 py-2 text-red-300">
                        OS
                      </div>
                      <div className="rounded-lg bg-pink-500/20 px-4 py-2 text-pink-300">
                        AND MORE
                      </div>
                    </div>
                  )}

                  {feature.title === "Focus" && (
                    <div className="text-center">
                      <h3 className="text-5xl font-black text-purple-400">
                        25:00
                      </h3>
                      <p className="mt-2 text-gray-500">Current Session</p>
                    </div>
                  )}

                  {feature.title === "AI Assistant" && (
                    <div className="rounded-2xl bg-white/5 p-5">
                      <p className="text-purple-300">
                        Explain Binary Search Tree
                      </p>
                      <p className="mt-3 text-sm text-gray-400">
                        ✓ Generated summary
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        ✓ Created quiz
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        ✓ Added flashcards
                      </p>
                    </div>
                  )}

                  {feature.title === "Analytics" && (
                    <div className="flex h-28 items-end gap-3">
                      <div className="h-12 w-8 rounded bg-purple-500/40" />
                      <div className="h-20 w-8 rounded bg-purple-500/60" />
                      <div className="h-28 w-8 rounded bg-purple-500" />
                      <div className="h-16 w-8 rounded bg-purple-500/50" />
                      <div className="h-24 w-8 rounded bg-purple-500/70" />
                    </div>
                  )}

                  {feature.title === "Flashcards" && (
                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
                      <p className="text-sm text-gray-400">Question</p>
                      <p className="mt-2 text-xl text-white">
                        What is Big-O notation?
                      </p>
                      <div className="mt-6 text-purple-400">
                        Tap to reveal →
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* And Many More */}
          <div className="mt-16 overflow-hidden rounded-3xl border border-purple-500/20 bg-linear-to-r from-purple-900/20 via-black/40 to-purple-900/20 p-12 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                  And Many More
                </p>

                <h2 className="text-4xl font-black text-white">
                  Discover The Complete
                  <br />
                  StudyOS Ecosystem!
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-400">
                  Goal Tracking, Study-Groups, Revision Schedules, Achievements,
                  Cloud Sync, AI roadmaps, Widgets, Collaborative Workspaces and
                  Dozens of Tools Designed For Your Academic Excellence.
                </p>
              </div>

              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-6xl">
                ✨
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;