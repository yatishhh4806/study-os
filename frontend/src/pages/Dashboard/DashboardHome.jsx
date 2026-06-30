import { getDashboardGreeting } from "../../utils/DashboardGreeting";
import { useMemo } from "react";
import { BookOpen, Calendar, CheckCircle2 } from "lucide-react";

const currentUser = {
  name: "Yatish",
  studyStreak: 18,
  pendingTasks: 6,
  productivity: 87,
  focusScore: 82,
};

function DashboardHome() {
  const greeting = useMemo(() => getDashboardGreeting(currentUser), []);

  return (
    <div className="relative min-h-screen bg-[#09070f] p-8">
      {/* Glow */}
      <div className="absolute right-0 top-0 h-125 w-125 rounded-full bg-purple-500/10 blur-[180px]" />

      <div className="relative z-10">
        {/* Dashboard Greeting */}
        <div className="mb-10 overflow-hidden rounded-4xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
          <div className="grid gap-10 xl:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div>
              {/* Greeting */}
              <div>
                <h1 className="text-5xl font-black tracking-tight text-white">
                  {greeting.title}
                </h1>

                <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-400">
                  {greeting.subtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                <button className="rounded-2xl bg-purple-500 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-purple-600">
                  Continue Studying
                </button>

                <button className="rounded-2xl border border-white/10 bg-black/30 px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-purple-500/30 hover:bg-white/5">
                  Start Focus Session
                </button>
              </div>

              {/* Metrics */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Study Hours</p>
                  <h2 className="mt-2 text-3xl font-black text-white">24.5h</h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Streak</p>
                  <h2 className="mt-2 text-3xl font-black text-purple-400">
                    {currentUser.studyStreak}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Tasks</p>
                  <h2 className="mt-2 text-3xl font-black text-white">
                    {currentUser.pendingTasks}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-gray-400">Productivity</p>
                  <h2 className="mt-2 text-3xl font-black text-purple-400">
                    {currentUser.productivity}%
                  </h2>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-5">
              {/* Focus Score */}
              <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6">
                <p className="text-sm text-gray-400">Focus Score</p>

                <h1 className="mt-3 text-6xl font-black text-purple-400">
                  {currentUser.focusScore}
                </h1>

                <p className="mt-2 text-sm text-purple-200">
                  Excellent consistency
                </p>
              </div>

              {/* Daily Goal */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <p className="text-sm text-gray-400">Today's Goal</p>

                <h3 className="mt-3 text-lg font-semibold text-white">
                  Complete 4 study sessions
                </h3>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[60%] rounded-full bg-purple-500" />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Progress</span>

                  <span className="text-sm font-semibold text-purple-300">
                    60%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Study Plan */}
          <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl lg:col-span-2">
            <div className="mb-8 flex items-center gap-3">
              <BookOpen className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Today's Study Plan
              </h2>
            </div>

            <div className="space-y-5">
              {[
                "Complete React Dashboard",
                "Practice DSA Graphs",
                "Review DBMS Notes",
                "Study Machine Learning",
              ].map((task) => (
                <div
                  key={task}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <CheckCircle2 className="text-purple-400" size={22} />
                  <p className="text-lg text-white">{task}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Calendar className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Deadlines</h2>
            </div>

            <div className="space-y-5">
              {[
                {
                  title: "SEPM Assignment",
                  date: "Tomorrow",
                },
                {
                  title: "ML Project",
                  date: "3 Days",
                },
                {
                  title: "React Project",
                  date: "5 Days",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-purple-300">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Focus */}
          <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Focus Session
            </h2>

            <div className="flex flex-col items-center">
              <div className="flex h-48 w-48 items-center justify-center rounded-full border-8 border-purple-500/20">
                <h1 className="text-5xl font-black text-purple-400">25</h1>
              </div>

              <button className="mt-8 rounded-2xl bg-purple-500 px-8 py-4 font-semibold text-white transition hover:bg-purple-600">
                Start Focus Session
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-bold text-white">Productivity</h2>

            <div className="flex h-75 items-end justify-between gap-3">
              {[45, 80, 55, 90, 65, 100, 75].map((h, i) => (
                <div key={i} className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-xl bg-purple-500"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;