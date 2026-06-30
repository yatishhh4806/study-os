import { useNavigate } from "react-router-dom";
import LiquidEther from "../HomePageBG/LiquidEther";

function HeroSection() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📝",
      title: "Notes",
      subtitle: "Smart note-taking",
    },
    {
      icon: "📅",
      title: "Planner",
      subtitle: "AI scheduling",
    },
    {
      icon: "⌚",
      title: "Focus",
      subtitle: "Deep work mode",
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      subtitle: "Personalized learning",
    },
    {
      icon: "📊",
      title: "Analytics",
      subtitle: "Study insights",
    },
    {
      icon: "🎓",
      title: "Flashcards",
      subtitle: "Spaced repetition",
    },
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

      {/* Hero Content */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-8 pt-20">
        <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">
          
          {/* LEFT SIDE */}
          <div>
            {/* Heading */}
            <h1 className="text-6xl font-black leading-[0.95] tracking-tight text-white lg:text-7xl">
              The OS for
              <br />
              <span className="italic text-purple-400">
                Academic
              </span>
              <br />
              <span className="italic text-purple-400">
                Excellence
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-xl text-lg leading-8 text-gray-300">
              The unified workspace built for high-performing students.
              Manage notes, tasks, assignments, calendars, focus
              sessions, AI-powered study assistance and much more in one
              beautiful ecosystem.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-5">
              <button
                onClick={() => navigate("/signup")}
                className="
                  rounded-xl
                  bg-purple-500
                  px-8
                  py-4
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-purple-500/30
                  transition
                  hover:scale-105
                "
              >
                Start Free Trial
              </button>

              <button
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-8
                  py-4
                  font-semibold
                  text-white
                  backdrop-blur-xl
                  transition
                  hover:bg-white/10
                "
              >
                View Demo
              </button>
            </div>

            {/* Feature Cards */}
            <div className="mt-12 grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/3
                    p-5
                    backdrop-blur-sm
                    transition-all
                    duration-300
                    hover:scale-[1.02]
                    hover:border-purple-500/30
                    hover:bg-purple-500/10
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-purple-500/20
                      bg-black/40
                      text-3xl
                    "
                  >
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-400">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-14 flex gap-14">
              <div>
                <h2 className="text-3xl font-bold text-white">--</h2>
                <p className="text-gray-400">Students</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white">--</h2>
                <p className="text-gray-400">Sessions</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white">--</h2>
                <p className="text-gray-400">Productivity</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex justify-center">
            {/* Glow */}
            <div className="absolute h-87.5 w-87.5 rounded-full bg-purple-500/20 blur-[60px]" />

            {/* Main Card */}
            <div
              className="
                relative
                h-140
                w-115
                overflow-hidden
                rounded-3xl
                border
                border-purple-500/20
                bg-black/30
                backdrop-blur-md
              "
            >
              {/* Background Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-[100px] font-black tracking-tight text-white/5">
                  StudyOS
                </h1>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;