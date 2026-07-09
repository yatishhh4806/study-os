import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { GRADE_SUBJECTS } from "../../data/gradeSubjects";

function SubjectPicker({ grade, onBack, onGenerate, isGenerating }) {
  const availableSubjects = GRADE_SUBJECTS[grade] || [];
  const [selected, setSelected] = useState([]);

  const toggleSubject = (subject) => {
    setSelected((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-10 backdrop-blur-xl">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-purple-300"
      >
        <ArrowLeft size={16} />
        Change grade
      </button>

      <h2 className="text-2xl font-bold text-white">Select your subjects</h2>
      <p className="mt-2 text-gray-400">{grade} — pick everything you want a roadmap for.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {availableSubjects.map((subject) => {
          const active = selected.includes(subject);
          return (
            <button
              key={subject}
              onClick={() => toggleSubject(subject)}
              className={`rounded-xl border px-5 py-3 font-medium transition ${
                active
                  ? "border-purple-500 bg-purple-500/20 text-purple-200"
                  : "border-purple-500/20 bg-white/5 text-gray-300 hover:border-purple-500/40"
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>

      <button
        disabled={selected.length === 0 || isGenerating}
        onClick={() => onGenerate(selected)}
        className="mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles size={18} />
        {isGenerating ? "Generating your roadmap..." : "Generate My Roadmap"}
      </button>
    </div>
  );
}

export default SubjectPicker;