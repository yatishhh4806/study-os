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
      className="relative min-h-screen w-full overflow-hidden bg-[#050308]"
    >
      {/* Floating Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-10 right-1/4 h-[450px] w-[450px] rounded-full bg-cyan-600/5 blur-[100px] animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-900/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-4 py-8 md:px-6 md:py-10 xl:px-10">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          
          {/* Column 1: Analytics */}
          <div className="col-span-12 lg:col-span-12 xl:col-span-3 order-3 xl:order-1">
            <FocusAnalytics
              loading={loading}
              sessions={sessions}
              liveMinutes={liveSeconds}
            />
          </div>

          {/* Column 2: Pomodoro Timer & Motivational Strip */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-5 order-1 xl:order-2 flex flex-col gap-6 lg:gap-8">
            <PomodoroTimer
              onTick={setLiveSeconds}
              onSessionLogged={loadSessions}
            />
            <MotivationStrip />
          </div>

          {/* Column 3: Focus Music Container */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 order-2 xl:order-3">
            <FocusMusicContainer />
          </div>

        </div>
      </div>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float-slow {
          animation: floatSlow 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Focus;