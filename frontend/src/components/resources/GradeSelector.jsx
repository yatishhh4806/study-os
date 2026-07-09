import { GRADE_SUBJECTS } from "../../data/gradeSubjects";

function GradeSelector({ onSelect }) {
  const grades = Object.keys(GRADE_SUBJECTS);

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-10 backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white">What are you studying?</h2>
      <p className="mt-2 text-gray-400">Pick your grade or year to get started.</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => onSelect(grade)}
            className="group rounded-2xl border border-purple-500/20 bg-white/5 px-5 py-4 text-left transition hover:border-purple-500/50 hover:bg-purple-500/10"
          >
            <span className="font-semibold text-white group-hover:text-purple-300">
              {grade}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default GradeSelector;