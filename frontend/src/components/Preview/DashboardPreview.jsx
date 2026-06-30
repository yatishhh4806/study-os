function DashboardPreview() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Heading */}
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black text-white">Experience StudyOS</h2>

        <p className="mt-4 text-lg text-gray-400">
          Your complete academic operating system.
        </p>
      </div>

      {/* Dashboard */}
      <div className="overflow-hidden rounded-4xl border border-purple-500/20 bg-[#0A0912]/80 p-6 backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-2 rounded-3xl border border-white/5 bg-black/30 p-5">
            <h3 className="mb-8 text-2xl font-bold text-white">StudyOS</h3>

            <div className="space-y-3">
              {[
                "Dashboard",
                "Notes",
                "Planner",
                "Focus",
                "AI Tutor",
                "Analytics",
              ].map((item, index) => (
                <div
                  key={item}
                  className={`rounded-xl p-3 transition ${
                    index === 0
                      ? "bg-purple-500 text-white"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="col-span-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-white">
                  Good morning, Alex.
                </h1>

                <p className="mt-2 text-gray-400">
                  You have 3 classes and 2 assignments today.
                </p>
              </div>

              <button className="rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white">
                Ask AI
              </button>
            </div>

            {/* Top Row */}
            <div className="grid grid-cols-12 gap-6">
              {/* AI Card */}
              <div className="col-span-8 rounded-3xl border border-purple-500/20 bg-linear-to-br from-purple-900/20 to-black p-8">
                <p className="mb-4 text-sm font-semibold text-purple-400">
                  ✨ AI ASSISTANT
                </p>

                <h2 className="text-4xl font-bold text-white">
                  What would you like
                  <br />
                  to study today?
                </h2>

                <div className="mt-8 flex gap-4">
                  <button className="rounded-xl bg-purple-500 px-5 py-3 text-white">
                    Summarize Notes
                  </button>

                  <button className="rounded-xl bg-white/5 px-5 py-3 text-white">
                    Flashcards
                  </button>

                  <button className="rounded-xl bg-white/5 px-5 py-3 text-white">
                    Quiz
                  </button>
                </div>
              </div>

              {/* Streak */}
              <div className="col-span-4 rounded-3xl border border-white/5 bg-black/30 p-8 text-center">
                <div className="text-7xl font-black text-purple-400">42</div>

                <p className="mt-2 text-xl text-white">Day Streak</p>

                <p className="mt-4 text-gray-400">Top 5% students</p>
              </div>
            </div>

            {/* Second Row */}
            <div className="mt-6 grid grid-cols-3 gap-6">
              {/* Classes */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <h3 className="mb-5 text-xl font-bold text-white">
                  Today's Classes
                </h3>

                <div className="space-y-4">
                  <div className="rounded-xl bg-white/5 p-4">
                    Advanced Algorithms
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    Human Computer Interaction
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    Database Systems
                  </div>
                </div>
              </div>

              {/* Focus */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <h3 className="text-xl font-bold text-white">Focus Session</h3>

                <div className="mt-8 text-center">
                  <div className="text-6xl font-black text-purple-400">
                    25:00
                  </div>

                  <p className="mt-4 text-gray-400">Data Structures</p>

                  <p className="mt-8 text-green-400">4h 23m today</p>
                </div>
              </div>

              {/* Productivity */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <h3 className="text-xl font-bold text-white">Productivity</h3>

                <div className="mt-8">
                  <div className="text-6xl font-black text-green-400">92%</div>

                  <div className="mt-6 h-3 rounded-full bg-white/10">
                    <div className="h-3 w-[92%] rounded-full bg-purple-500" />
                  </div>

                  <p className="mt-4 text-gray-400">+12% this week</p>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <h3 className="text-xl font-bold text-white">
                  Upcoming Assignments
                </h3>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl bg-white/5 p-4">
                    ML Project Phase 1
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    Ethics Assignment
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <h3 className="text-xl font-bold text-white">Study Activity</h3>

                <div className="mt-8 grid grid-cols-10 gap-2">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded bg-purple-500/50"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPreview;
