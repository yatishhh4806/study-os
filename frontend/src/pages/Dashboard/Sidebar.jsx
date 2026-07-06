import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Timer,
  Brain,
  Bot,
  BarChart3,
  LibraryBig,
  Trophy,
  CircleStar
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { icon: <LayoutDashboard size={20} />, title: "Dashboard", path: "/dashboard" },
    { icon: <BookOpen size={20} />, title: "Notes", path: "/dashboard/notes" },
    { icon: <Calendar size={20} />, title: "Planner", path: "/dashboard/planner" },
    { icon: <Brain size={20} />, title: "Flashcards", path: "/dashboard/flashcards" },
    { icon: <Bot size={20} />, title: "AI Tutor", path: "/dashboard/ai-tutor" },
    { icon: <LibraryBig size={20} />, title: "Resources", path: "/dashboard/resources" },
    { icon: <Trophy size={20} />, title: "Leaderboard", path: "/dashboard/leaderboard" },
    { icon: <CircleStar size={20} />, title: "Badges", path: "/dashboard/badges" },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-70 flex-col border-r border-purple-500/10 bg-black/40 backdrop-blur-xl">
      {/* Logo — height + top offset matched to Topbar's h-24 + top-3, so both headers land on the same row */}
      <div className="mt-3 h-24 flex flex-col justify-center px-8 border-b border-purple-500/10">
        <h1 className="text-4xl font-black text-white">
          Study
          <span className="text-purple-400">OS</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">Built For Your Excellence</p>
      </div>

      {/* Menu */}
      <div className="space-y-3 px-8 pt-8">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition ${
                isActive
                  ? "bg-purple-500/15 text-white"
                  : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-purple-400" : "text-purple-400"}>
                {item.icon}
              </span>

              <span className="font-medium">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Card */}
      <div
        className="mt-auto mx-8 mb-8 cursor-pointer rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/40 hover:bg-purple-500/20"
      >
        <h3 className="text-xl font-bold text-white">Focus Mode</h3>

        <p className="mt-3 text-gray-400">
          Stay distraction free and maximize productivity.
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/dashboard/focus");
          }}
          className="mt-6 w-full rounded-2xl bg-purple-500 py-3 font-semibold text-white transition hover:bg-purple-400 cursor-pointer"
        >
          Start
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;