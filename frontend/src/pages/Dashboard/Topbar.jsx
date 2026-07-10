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
import { useAuth } from "../context/AuthContext";

// detect Mac vs Windows/Linux once, so the badge shows the shortcut
// that's actually correct for the person's keyboard
const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fallbacks only cover the brief window before /auth/me resolves on
  // first load — once `user` is populated these are never used.
  const displayName = user?.name || "Student";
  const displaySubtitle =
    user?.academicProfile?.course || user?.academicProfile?.institutionType || "StudyOS Member";
  const avatarUrl = user?.avatarUrl || user?.avatarFromGoogle || user?.avatarFromGithub || null;

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

  async function handleLogout() {
    setIsProfileOpen(false);
    await logout();
    navigate("/login");
  }

  function openCommandPalette() {
    window.dispatchEvent(new Event("studyos:open-command-palette"));
  }

  return (
    <header className="sticky top-3 z-50 flex h-24 items-center justify-between border-b border-purple-500/10 bg-[#09050e]/80 px-8 backdrop-blur-xl">
      {/* Search */}
      <div className="group relative w-full max-w-275">
        {/* Glow */}
        <div
          className={`absolute -inset-px rounded-2xl bg-linear-to-r from-purple-500/30 via-purple-400/20 to-purple-500/30 blur-md transition-all duration-300 ${
            focused
              ? "opacity-100 blur-xl"
              : "opacity-30 group-hover:opacity-70 group-hover:blur-lg"
          }`}
        />

        {/* Main Container */}
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

          {/* Command palette shortcut badge — shows Ctrl+K on Windows/Linux, ⌘K on Mac */}
          <button
            type="button"
            onClick={openCommandPalette}
            title="Open command palette"
            className="mr-3 hidden shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-gray-400 transition-colors hover:border-purple-400/40 hover:text-purple-300 sm:flex"
          >
            {isMac ? (
              <kbd className="font-sans">⌘</kbd>
            ) : (
              <kbd className="font-sans">Ctrl</kbd>
            )}
            <kbd className="font-sans">K</kbd>
          </button>
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
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-12 w-12 rounded-full border border-purple-500/30 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-br from-purple-500 to-purple-700 text-sm font-semibold text-white">
                {getInitials(displayName)}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-white">{displayName}</h3>
              <p className="text-sm text-gray-400">{displaySubtitle}</p>
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
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-gray-400">{displaySubtitle}</p>
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