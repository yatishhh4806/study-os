import { useState, useEffect, useCallback } from "react";
import FocusAnalytics from "../components/Focus/FocusAnalytics";
import PomodoroTimer from "../components/Focus/PomodoroTimer";
import MotivationStrip from "../components/Focus/Motivational";
import { api } from "../lib/api";
import FocusMusicContainer from "../components/Focus/FocusMusic/FocusMusicContainer";

function Focus() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(0);

  const loadSessions = useCallback(async () => {
    try {
      const { data } = await api.get("/focus-sessions", {
        params: { days: 30 },
      });

      setSessions(data.sessions);
    } catch (err) {
      console.error("Failed to load focus sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `
          radial-gradient(circle at top,
          rgba(139,92,246,.18),
          transparent 42%),

          radial-gradient(circle at bottom right,
          rgba(34,211,238,.06),
          transparent 38%),

          #050308
        `,
      }}
    >
      <div className="mx-auto w-full max-w-[1700px] px-6 py-10 xl:px-10">

        <div className="grid gap-8 xl:grid-cols-[340px_minmax(650px,1fr)_420px]">

          {/* Analytics */}

          <FocusAnalytics
            loading={loading}
            sessions={sessions}
            liveMinutes={liveSeconds}
          />

          {/* Pomodoro */}

          <div className="flex flex-col gap-8">

            <PomodoroTimer
              onTick={setLiveSeconds}
              onSessionLogged={loadSessions}
            />

            <MotivationStrip />

          </div>

          {/* Focus Music */}

          <FocusMusicContainer />

        </div>

      </div>
    </div>
  );
}

export default Focus;