import "./MagicBento.css";

const cards = [
  {
    label: "Notes",
    title: "Smart Notes",
    description: "Create and organize notes with markdown support.",
  },
  {
    label: "AI",
    title: "AI Assistant",
    description: "Personalized AI learning and study guidance.",
  },
  {
    label: "Planner",
    title: "Study Planner",
    description: "Manage classes, assignments and deadlines.",
  },
  {
    label: "Focus",
    title: "Pomodoro",
    description: "Deep work and focus sessions.",
  },
  {
    label: "Stats",
    title: "Analytics",
    description: "Track performance and productivity.",
  },
  {
    label: "Memory",
    title: "Flashcards",
    description: "Spaced repetition revision engine.",
  },
  {
    label: "Goals",
    title: "Goals",
    description: "Daily and semester study targets.",
  },
  {
    label: "Rewards",
    title: "Achievements",
    description: "Gamified learning milestones.",
  },
  {
    label: "Workspace",
    title: "Dashboard",
    description: "Your complete academic workspace.",
  },
];

function MagicBento() {
  return (
    <section className="w-full">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="
              group
              relative
              min-h-65
              overflow-hidden
              rounded-3xl
              border
              border-purple-500/20
              bg-[#120F17]
              p-8
              backdrop-blur-sm
              transition-all
              duration-500
              hover:-translate-y-2
              hover:scale-[1.02]
              hover:border-purple-500/50
              hover:shadow-[0_0_50px_rgba(132,0,255,0.25)]
            "
          >
            {/* Spotlight */}
            <div
              className="
                absolute
                inset-0
                opacity-0
                transition
                duration-500
                group-hover:opacity-100
                bg-[radial-gradient(circle_at_center,rgba(132,0,255,0.18),transparent_70%)]
              "
            />

            {/* Floating Glow */}
            <div
              className="
                absolute
                -right-10
                -top-10
                h-40
                w-40
                rounded-full
                bg-purple-500/20
                blur-3xl
                opacity-0
                transition
                duration-500
                group-hover:opacity-100
              "
            />

            {/* Animated Border */}
            <div
              className="
                absolute
                inset-0
                rounded-3xl
                border
                border-purple-500/0
                transition
                duration-500
                group-hover:border-purple-500/40
              "
            />

            <div className="relative z-10 flex h-full flex-col justify-between">
              {/* Label Box */}
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-purple-500/20
                  bg-black/30
                  text-sm
                  font-semibold
                  text-purple-300
                  backdrop-blur-sm
                "
              >
                {card.label}
              </div>

              <div>
                <h3 className="mb-3 text-3xl font-bold text-white">
                  {card.title}
                </h3>

                <p className="leading-7 text-gray-400">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MagicBento;