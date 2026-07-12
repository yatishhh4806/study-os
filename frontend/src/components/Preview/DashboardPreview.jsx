import {
  Search,
  Bell,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Calendar,
  Layers,
  Bot,
  Library,
  Trophy,
  Award,
  Clock,
  ChevronDown,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Notes" },
  { icon: Calendar, label: "Planner" },
  { icon: Layers, label: "Flashcards" },
  { icon: Bot, label: "AI Tutor" },
  { icon: Library, label: "Resources" },
  { icon: Trophy, label: "Leaderboard" },
  { icon: Award, label: "Badges" },
];

function DashboardPreview() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Dashboard */}
      <div className="overflow-hidden rounded-4xl border border-purple-500/20 bg-[#0A0912]/80 p-6 backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-2 flex flex-col justify-between rounded-3xl border border-white/5 bg-black/30 p-5">
            <div>
              <div className="mb-8 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-400" />
                <h3 className="text-xl font-bold text-white">
                  Study<span className="text-purple-400">OS</span>
                </h3>
              </div>

              <div className="space-y-2">
                {SIDEBAR_ITEMS.map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-xl p-3 text-sm transition ${
                      active
                        ? "bg-purple-500 text-white"
                        : "text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Focus Mode card */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
              <p className="text-sm font-semibold text-white">Focus Mode</p>
              <p className="mt-1 text-xs text-gray-400">
                Stay distraction free and maximize productivity.
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-purple-500 py-2 text-xs font-semibold text-white">
                <Clock size={12} />
                Start
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="col-span-10">
            {/* Top bar */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-purple-500/20 bg-black/30 px-4 py-3 text-gray-500">
                <Search size={16} />
                <span className="text-sm">Search notes, tasks, flashcards...</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-300">
                <Sparkles size={16} />
                StudyAI
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-gray-400">
                <Bell size={16} />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5">
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-purple-700" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Arjun Mehta</p>
                  <p className="text-[10px] text-gray-400">B.Tech · CSE</p>
                </div>
                <ChevronDown size={12} className="text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold text-orange-400">
                  🔥 12-day streak · Wednesday, 9 July
                </p>
                <h1 className="text-4xl font-bold text-white">
                  Welcome back, Arjun.
                </h1>
                <p className="mt-2 text-gray-400">
                  Let's pick up where you left off.
                </p>
              </div>

              <div className="flex gap-3">
                <button className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white">
                  Continue Studying
                </button>
                <button className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white">
                  View Planner
                </button>
              </div>
            </div>

            {/* Stat pills */}
            <div className="mb-6 grid grid-cols-4 gap-6">
              <div className="rounded-3xl border border-white/5 bg-black/30 p-5 text-center">
                <div className="text-3xl font-black text-white">4h 30m</div>
                <p className="mt-1 text-sm text-gray-400">Study Hours</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-black/30 p-5 text-center">
                <div className="text-3xl font-black text-orange-400">12d</div>
                <p className="mt-1 text-sm text-gray-400">Streak</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-black/30 p-5 text-center">
                <div className="text-3xl font-black text-green-400">68%</div>
                <p className="mt-1 text-sm text-gray-400">Today's Progress</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-black/30 p-5 text-center">
                <div className="text-3xl font-black text-purple-400">8</div>
                <p className="mt-1 text-sm text-gray-400">Due Cards</p>
              </div>
            </div>

            {/* Middle Row */}
            <div className="mb-6 grid grid-cols-3 gap-6">
              {/* Study Plan */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-bold text-white">
                    <BookOpen size={16} className="text-purple-400" />
                    Study Plan
                  </h3>
                  <span className="text-xs text-gray-500">3/5 done</span>
                </div>
                <div className="mb-4 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 w-3/5 rounded-full bg-purple-500" />
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    Review DBMS normalization
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    Finish ML assignment draft
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                  <Calendar size={16} className="text-purple-400" />
                  Today's Schedule
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    Advanced Algorithms · 10:00 AM
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    Human Computer Interaction · 1:00 PM
                  </div>
                </div>
              </div>

              {/* Deadlines */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Deadlines</h3>
                  <span className="text-xs text-purple-400">All →</span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    ML Project Phase 1
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    Ethics Assignment
                  </div>
                </div>
                <div className="mt-4 flex gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Urgent
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> Soon
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Relaxed
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-6">
              {/* Subject Mastery */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Subject Mastery</h3>
                  <span className="text-xs text-gray-500">via flashcards</span>
                </div>
                <div className="space-y-4">
                  {[
                    ["Data Structures", 82],
                    ["Machine Learning", 64],
                    ["Operating Systems", 38],
                  ].map(([label, pct]) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm text-gray-300">
                        <span>{label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-purple-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Heatmap */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Study Heatmap</h3>
                  <span className="text-xs text-gray-500">Last 30 days</span>
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const intensity = [
                      "bg-white/5",
                      "bg-purple-500/30",
                      "bg-purple-500/60",
                      "bg-purple-500",
                    ][Math.floor(Math.random() * 4)];
                    return <div key={i} className={`aspect-square rounded ${intensity}`} />;
                  })}
                </div>
                <div className="mt-4 flex justify-between text-center text-xs">
                  <div>
                    <p className="font-bold text-orange-400">12d</p>
                    <p className="text-gray-500">Current Streak</p>
                  </div>
                  <div>
                    <p className="font-bold text-white">21d</p>
                    <p className="text-gray-500">Best Streak</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-400">640</p>
                    <p className="text-gray-500">Weekly XP</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
                <h3 className="mb-4 text-base font-bold text-white">Recent Activity</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-purple-400" />
                    Updated "DBMS" notes
                    <span className="ml-auto text-xs text-gray-500">2d ago</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-purple-400" />
                    Reviewed 12 flashcards
                    <span className="ml-auto text-xs text-gray-500">3d ago</span>
                  </div>
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