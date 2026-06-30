import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Timer,
  Brain,
  Bot,
  BarChart3,
  Settings,
} from "lucide-react";

function Sidebar() {
  const menu = [
    {
      icon: <LayoutDashboard size={20} />,
      title: "Dashboard",
    },
    {
      icon: <BookOpen size={20} />,
      title: "Notes",
    },
    {
      icon: <Calendar size={20} />,
      title: "Planner",
    },
    {
      icon: <Timer size={20} />,
      title: "Focus",
    },
    {
      icon: <Brain size={20} />,
      title: "Flashcards",
    },
    {
      icon: <Bot size={20} />,
      title: "AI Tutor",
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Analytics",
    },
    {
      icon: <Settings size={20} />,
      title: "Settings",
    },
  ];

  return (
    <aside
      className="
        sticky
        top-0
        flex
        h-screen
        w-70
        flex-col
        border-r
        border-purple-500/10
        bg-black/40
        p-8
        backdrop-blur-xl
      "
    >
      {/* Logo */}
      <div className="mb-14">
        <h1 className="text-4xl font-black text-white">
          Study
          <span className="text-purple-400">OS</span>
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Academic Operating System
        </p>
      </div>

      {/* Menu */}
      <div className="space-y-3">
        {menu.map((item) => (
          <button
            key={item.title}
            className="
              flex
              w-full
              items-center
              gap-4
              rounded-2xl
              px-5
              py-4
              text-gray-300
              transition
              hover:bg-purple-500/10
              hover:text-white
            "
          >
            <span className="text-purple-400">
              {item.icon}
            </span>

            <span className="font-medium">
              {item.title}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Card */}
      <div
        className="
          mt-auto
          rounded-3xl
          border
          border-purple-500/20
          bg-purple-500/10
          p-6
        "
      >
        <h3 className="font-bold text-white">
          Focus Mode
        </h3>

        <p className="mt-2 text-sm text-gray-300">
          Stay distraction free and maximize productivity.
        </p>

        <button
          className="
            mt-5
            w-full
            rounded-xl
            bg-purple-500
            py-3
            font-semibold
            text-white
          "
        >
          Start
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;