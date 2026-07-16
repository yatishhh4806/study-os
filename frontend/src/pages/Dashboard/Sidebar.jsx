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
    // h-dvh instead of h-screen: accounts for browser chrome / dynamic
    // viewport height instead of a stale 100vh value
    <aside className="sticky top-0 flex h-dvh w-70 flex-col border-r border-purple-500/10 bg-black/40 backdrop-blur-xl">
      {/* Logo — shrink-0 so it never gets squeezed, but its own height
          is fluid so it doesn't eat a fixed 96px on short screens */}
      <div className="mt-[clamp(6px,1vh,12px)] h-[clamp(64px,11vh,96px)] flex shrink-0 items-center gap-3 px-8 border-b border-purple-500/10">
        <img
          src="/logo.png"
          alt="StudyOS logo"
          className="h-9 w-9 rounded-xl object-contain shrink-0"
        />
        <div>
          <h1 className="text-3xl font-black text-white leading-none">
            Study
            <span className="text-purple-400">OS</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400 leading-none">Built For Your Excellence</p>
        </div>
      </div>

      {/* Menu — flex-1 + min-h-0 lets this section be the one that
          compresses first; gap/padding are fluid instead of fixed */}
      <div className="flex flex-1 min-h-0 flex-col gap-[clamp(4px,1.1vh,12px)] px-8 pt-[clamp(12px,2.5vh,32px)] overflow-y-auto">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`flex w-full shrink-0 items-center gap-4 rounded-2xl px-5 py-[clamp(8px,1.5vh,16px)] transition ${
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

      {/* Bottom Card — shrink-0 so it's always fully visible;
          its internal padding/margins scale down on short screens */}
      <div
        className="mt-auto mx-8 mb-[clamp(12px,2vh,32px)] shrink-0 cursor-pointer rounded-3xl border border-purple-500/20 bg-purple-500/10 p-[clamp(14px,2.2vh,24px)] transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/40 hover:bg-purple-500/20"
      >
        <h3 className="text-[clamp(16px,1.8vh,20px)] font-bold text-white">Focus Mode</h3>

        <p className="mt-[clamp(4px,1vh,12px)] text-[clamp(12px,1.4vh,14px)] text-gray-400">
          Stay distraction free and maximize productivity.
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/dashboard/focus");
          }}
          className="mt-[clamp(8px,1.6vh,24px)] w-full rounded-2xl bg-purple-500 py-[clamp(8px,1.4vh,12px)] font-semibold text-white transition hover:bg-purple-400 cursor-pointer"
        >
          Start
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;