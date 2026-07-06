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
  const [focused, setFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
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
    <header className="sticky top-3 z-50 flex h-24 items-center justify-between border-b border-purple-500/10 bg-[#09050e]/80 px-8 backdrop-blur-xl">
      {/* Search */}
      <div className="group relative w-full max-w-[1100px]">
        {/* Glow - Modified: Added a subtle resting opacity (opacity-30) so it glows slightly even when untouched */}
        <div
          className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 via-purple-400/20 to-purple-500/30 blur-md transition-all duration-300 ${
            focused
              ? "opacity-100 blur-xl"
              : "opacity-30 group-hover:opacity-70 group-hover:blur-lg"
          }`}
        />

        {/* Main Container - Modified: Increased base border to border-purple-500/25 and added a baseline resting box-shadow */}
        <div
          className={`relative flex items-center overflow-hidden rounded-2xl border bg-[#0d0716]/80 backdrop-blur-xl transition-all duration-300 ${
            focused
              ? "border-purple-500/60 shadow-[0_0_35px_rgba(168,85,247,0.25)]"
              : "border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.08)] hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
          }`}
        >
          {/* Search Icon */}
          <Search
            size={18}
            className={`ml-5 transition-all duration-300 ${
              focused
                ? "text-purple-400"
                : "text-gray-400 group-hover:text-purple-300"
            }`}
          />

          {/* Input */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search notes, tasks, flashcards..."
            className="flex-1 bg-transparent px-4 py-4 text-white outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* AI */}
        <button
          className="flex items-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-5 py-3 font-medium text-purple-300 transition-all hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          onClick={() => {
            navigate("/dashboard/ai-tutor");
          }}
        >
          <Sparkles size={18} className="text-purple-400" />
          StudyAI
        </button>

        {/* Notifications */}
        <button className="rounded-2xl border border-white/10 bg-black/30 p-4 text-gray-300 transition-colors hover:border-purple-500/30 hover:text-white">
          <Bell size={20} />
        </button>

        {/* Profile — clickable with dropdown */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent px-3 py-2 transition-all hover:border-purple-500/20 hover:bg-purple-500/10"
          >
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="profile"
              className="h-12 w-12 rounded-full border border-purple-500/30 object-cover"
            />

            <div>
              <h3 className="font-semibold text-white">Yatish</h3>
              <p className="text-sm text-gray-400">AIML Student</p>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-2xl border border-purple-500/20 bg-[#12091c]/95 shadow-xl shadow-black/50 backdrop-blur-xl">
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
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-purple-500/15 hover:text-white"
                >
                  <User size={16} className="text-purple-400" />
                  View Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/dashboard/settings");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-purple-500/15 hover:text-white"
                >
                  <Settings size={16} className="text-purple-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-white/10 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
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