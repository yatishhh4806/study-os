import DashboardPreview from "./DashboardPreview";

function Preview() {
  return (
    <div className="min-h-screen bg-[#09070f] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-32">
        {/* Glow */}
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-8 text-center">
          <h1 className="text-7xl font-black">
            Experience{" "}
            <span className="text-purple-400">StudyOS</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl text-gray-400">
            Discover how students organize notes, assignments,
            focus sessions, analytics and AI assistance
            inside one beautiful workspace.
          </p>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-8 pb-32">
        <DashboardPreview />
      </section>
    </div>
  );
}

export default Preview;