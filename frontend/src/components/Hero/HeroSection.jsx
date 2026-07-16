import { useNavigate } from "react-router-dom";
import LiquidEther from "../HomePageBG/LiquidEther";
import logoVideo from "../../assets/StudyOS_Logo_Animation.mp4";

function HeroSection() {
  const navigate = useNavigate();

  const features = [
    { icon: "📝", title: "Notes",        subtitle: "Smart note-taking"      },
    { icon: "📅", title: "Planner",      subtitle: "AI scheduling"          },
    { icon: "⌚", title: "Focus",        subtitle: "Deep work mode"         },
    { icon: "🤖", title: "AI Assistant", subtitle: "Personalized learning"  },
    { icon: "📊", title: "Analytics",    subtitle: "Study insights"         },
    { icon: "🎓", title: "Flashcards",   subtitle: "Spaced repetition"      },
  ];

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B497CF"]}
          mouseForce={15}
          cursorSize={80}
          isViscous
          viscous={15}
          iterationsViscous={8}
          iterationsPoisson={8}
          resolution={0.2}
          isBounce={false}
          autoDemo
          autoSpeed={0.2}
          autoIntensity={0.7}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Hero Content — pt is now fluid instead of a flat pt-20, so it
          shrinks on short viewports instead of eating fixed space */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-8 pt-[clamp(72px,12vh,96px)] pb-[clamp(24px,4vh,48px)]">
        <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-[clamp(32px,6vh,80px)] lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div>
            <h1 className="text-[clamp(36px,6.5vh,72px)] font-black leading-[0.95] tracking-tight text-white">
              The OS for
              <br />
              <span className="italic text-purple-400">Academic</span>
              <br />
              <span className="italic text-purple-400">Excellence</span>
            </h1>

            <p className="mt-[clamp(16px,3vh,32px)] max-w-xl text-[clamp(14px,1.8vh,18px)] leading-[1.6] text-gray-300">
              The unified workspace built for high-performing students.
              Manage notes, tasks, assignments, calendars, focus sessions,
              AI-powered study assistance and much more in one beautiful ecosystem.
            </p>

            <div className="mt-[clamp(16px,3.5vh,40px)] flex flex-wrap gap-[clamp(10px,1.5vh,20px)]">
              <button
                onClick={() => navigate("/signup")}
                className="rounded-xl bg-purple-500 px-[clamp(20px,2.5vw,32px)] py-[clamp(10px,1.8vh,16px)] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105"
              >
                Start Free Trial
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-[clamp(20px,2.5vw,32px)] py-[clamp(10px,1.8vh,16px)] font-semibold text-white backdrop-blur-xl transition hover:bg-white/10">
                View Demo
              </button>
            </div>

            <div className="mt-[clamp(20px,4vh,48px)] grid max-w-2xl grid-cols-1 gap-[clamp(8px,1.4vh,16px)] md:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="group flex items-center gap-[clamp(10px,1.6vh,16px)] rounded-2xl border border-white/10 bg-white/3 p-[clamp(10px,2vh,20px)] backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/30 hover:bg-purple-500/10"
                >
                  <div className="flex h-[clamp(36px,6vh,48px)] w-[clamp(36px,6vh,48px)] shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-black/40 text-[clamp(18px,3vh,28px)]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-[clamp(13px,1.7vh,16px)] font-semibold text-white">{item.title}</h3>
                    <p className="text-[clamp(11px,1.5vh,14px)] text-gray-400">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[clamp(24px,4.5vh,56px)] flex gap-[clamp(24px,4vw,56px)]">
              <div>
                <h2 className="text-[clamp(20px,3vh,30px)] font-bold text-white">--</h2>
                <p className="text-[clamp(12px,1.6vh,15px)] text-gray-400">Students</p>
              </div>
              <div>
                <h2 className="text-[clamp(20px,3vh,30px)] font-bold text-white">--</h2>
                <p className="text-[clamp(12px,1.6vh,15px)] text-gray-400">Sessions</p>
              </div>
              <div>
                <h2 className="text-[clamp(20px,3vh,30px)] font-bold text-white">--</h2>
                <p className="text-[clamp(12px,1.6vh,15px)] text-gray-400">Productivity</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — video */}
          <div className="relative flex items-center justify-center">
            {/* Purple glow behind — sized off vh too so it doesn't
                dwarf a compressed left column on short screens */}
            <div className="absolute h-[clamp(220px,42vh,500px)] w-[clamp(220px,42vh,500px)] rounded-full bg-purple-500/30 blur-[100px]" />

            {/* Video wrapper — capped by vh via max-height so the whole
                hero (including "Learn Smarter, Study Better" baked into
                the video) stays inside the fold instead of pushing past it */}
            <div
              className="relative w-full max-w-165"
              style={{
                maxHeight: "70vh",
                maskImage: "radial-gradient(ellipse 65% 72% at 50% 50%, black 45%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse 65% 72% at 50% 50%, black 45%, transparent 80%)",
              }}
            >
              <video
                src={logoVideo}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  display: "block",
                  mixBlendMode: "screen",
                  filter: "brightness(0.95) contrast(1.1) saturate(1.1)",
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;