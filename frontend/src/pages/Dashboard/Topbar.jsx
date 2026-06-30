import {
  Search,
  Bell,
  Sparkles,
} from "lucide-react";

function Topbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        flex
        h-24
        items-center
        justify-between
        border-b
        border-purple-500/10
        bg-[#09070f]/80
        px-10
        backdrop-blur-xl
      "
    >
      {/* Search */}
      <div className="relative w-105">
        <Search
          size={18}
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          type="text"
          placeholder="Search notes, tasks, flashcards..."
          className="
            w-full
            rounded-2xl
            border
            border-purple-500/10
            bg-black/30
            py-4
            pl-12
            pr-4
            text-white
            outline-none
            placeholder:text-gray-500
            focus:border-purple-500/40
          "
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* AI */}
        <button
          className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-purple-500/20
            bg-purple-500/10
            px-5
            py-3
            text-purple-300
          "
        >
          <Sparkles size={18} />
          StudyAI
        </button>

        {/* Notifications */}
        <button
          className="
            rounded-2xl
            border
            border-white/10
            bg-black/30
            p-4
            text-gray-300
          "
        >
          <Bell size={20} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-4">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
            className="
              h-12
              w-12
              rounded-full
              border
              border-purple-500/30
            "
          />

          <div>
            <h3 className="font-semibold text-white">
              Yatish
            </h3>

            <p className="text-sm text-gray-400">
              AIML Student
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;