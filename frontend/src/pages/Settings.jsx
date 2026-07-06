import { useState } from "react";
import {
  Palette,
  BookOpen,
  Bell,
  Database,
  Cloud,
  Shield,
  Trash2,
  Download,
  Upload,
  Timer,
} from "lucide-react";

function Settings() {
  const [studyGoal, setStudyGoal] = useState(4);
  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);

  return (
    <div className="relative min-h-screen bg-[#09070f] p-8">
      {/* Glow */}
      <div className="absolute right-0 top-0 h-125 w-125 rounded-full bg-purple-500/10 blur-[180px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black text-white">
            Settings
          </h1>

          <p className="mt-3 text-lg text-gray-400">
            Customize your StudyOS experience.
          </p>
        </div>

        <div className="space-y-8">

          {/* Appearance */}
          <section className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Palette className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Appearance
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <label className="text-gray-400">
                  Theme
                </label>

                <select className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400">
                  Accent Color
                </label>

                <div className="mt-3 flex gap-3">
                  <button className="h-10 w-10 rounded-full bg-purple-500" />
                  <button className="h-10 w-10 rounded-full bg-blue-500" />
                  <button className="h-10 w-10 rounded-full bg-green-500" />
                  <button className="h-10 w-10 rounded-full bg-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-gray-400">
                  Interface Density
                </label>

                <select className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white">
                  <option>Comfortable</option>
                  <option>Compact</option>
                </select>
              </div>
            </div>
          </section>

          {/* Study Preferences */}
          <section className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <BookOpen className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Study Preferences
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <label className="text-gray-400">
                  Daily Study Goal
                </label>

                <input
                  type="number"
                  value={studyGoal}
                  onChange={(e) =>
                    setStudyGoal(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400">
                  Flashcards / Session
                </label>

                <input
                  type="number"
                  defaultValue={20}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400">
                  Weekly Goal
                </label>

                <input
                  type="number"
                  defaultValue={30}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>
            </div>
          </section>

          {/* Focus */}
          <section className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Timer className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Focus Preferences
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <label className="text-gray-400">
                  Pomodoro Duration
                </label>

                <input
                  type="number"
                  value={pomodoro}
                  onChange={(e) =>
                    setPomodoro(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400">
                  Short Break
                </label>

                <input
                  type="number"
                  value={shortBreak}
                  onChange={(e) =>
                    setShortBreak(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400">
                  Long Break
                </label>

                <input
                  type="number"
                  value={longBreak}
                  onChange={(e) =>
                    setLongBreak(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Bell className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Notifications
              </h2>
            </div>

            <div className="space-y-5">
              {[
                "Study reminders",
                "Flashcard reminders",
                "Deadline reminders",
                "Weekly reports",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between"
                >
                  <span className="text-white">
                    {item}
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Data */}
          <section className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Database className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Data & Backup
              </h2>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-3 rounded-xl bg-purple-500 px-6 py-4 text-white">
                <Download size={18} />
                Export Data
              </button>

              <button className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-6 py-4 text-white">
                <Upload size={18} />
                Import Backup
              </button>
            </div>
          </section>

          {/* Sync */}
          <section className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Cloud className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Sync & Integrations
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white">
                  Google Account
                </span>

                <span className="text-green-400">
                  Connected
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white">
                  Cloud Sync
                </span>

                <span className="text-purple-400">
                  Enabled
                </span>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Shield className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Security
              </h2>
            </div>

            <div className="space-y-4">
              <button className="w-full rounded-xl border border-white/10 bg-black/30 p-4 text-left text-white">
                Change Password
              </button>

              <button className="w-full rounded-xl border border-white/10 bg-black/30 p-4 text-left text-white">
                Manage Sessions
              </button>
            </div>
          </section>

          {/* Danger */}
          <section className="rounded-3xl border border-red-500/20 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <Trash2 className="text-red-400" />
              <h2 className="text-2xl font-bold text-white">
                Danger Zone
              </h2>
            </div>

            <button className="rounded-xl bg-red-500 px-6 py-4 font-semibold text-white">
              Delete Account
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Settings;