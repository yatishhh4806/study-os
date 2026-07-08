import { useState, useEffect, useCallback } from "react";
import FocusAnalytics from "../components/Focus/FocusAnalytics";
import PomodoroTimer from "../components/Focus/PomodoroTimer";
import AmbientPanel from "../components/Focus/AmbientControls";
import MotivationStrip from "../components/Focus/Motivational";
import { api } from "../lib/api";

function Focus() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const { data } = await api.get("/focus-sessions", { params: { days: 30 } });
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
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(168,85,247,0.16), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(34,211,238,0.07), transparent 60%), #050308",
      }}
    >
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid items-start gap-8 xl:grid-cols-[340px_1fr_320px]">
          {/* FocusAnalytics is unchanged from its original mock version —
              it's already a pure component driven entirely by `sessions`,
              so passing real data in is the only thing that changed here. */}
          {!loading && <FocusAnalytics sessions={sessions} />}
          <div className="flex flex-col gap-8">
            <PomodoroTimer onSessionLogged={loadSessions} />
            <MotivationStrip />
          </div>
          <AmbientPanel />
        </div>
      </div>
    </div>
  );
}

export default Focus;