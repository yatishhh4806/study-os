import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    // TODO: wire to real auth sign-out once backend/Firebase auth exists
    console.log("Logout clicked — wire to auth.signOut()");
    setIsProfileOpen(false);
  }

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

        {/* Profile — now clickable with dropdown */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen((v) => !v)}
            className="
              flex
              items-center
              gap-4
              cursor-pointer
              rounded-2xl
              px-3
              py-2
              transition-colors
              hover:bg-purple-500/10
            "
          >
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
              <h3 className="font-semibold text-white">Yatish</h3>
              <p className="text-sm text-gray-400">AIML Student</p>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+8px)]
                w-56
                overflow-hidden
                rounded-2xl
                border
                border-purple-500/15
                bg-[#0f0c16]/95
                shadow-xl
                shadow-black/40
                backdrop-blur-xl
              "
            >
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">Yatish</p>
                <p className="text-xs text-gray-400">AIML Student</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/dashboard/profile");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-2.5
                    text-sm
                    text-gray-300
                    transition-colors
                    hover:bg-purple-500/10
                    hover:text-white
                  "
                >
                  <User size={16} />
                  View Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/dashboard/settings");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-2.5
                    text-sm
                    text-gray-300
                    transition-colors
                    hover:bg-purple-500/10
                    hover:text-white
                  "
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>

              <div className="border-t border-white/10 py-1">
                <button
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-2.5
                    text-sm
                    text-red-400
                    transition-colors
                    hover:bg-red-500/10
                  "
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;