import { FolderPlus } from "lucide-react";

function SubjectSidebar({
  subjects,
  selectedSubject,
  setSelectedSubject,
  addSubject,
}) {
  return (
    <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-xl">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Subjects
        </h2>

        <button
          onClick={addSubject}
          className="rounded-xl bg-purple-500 p-3 text-white"
        >
          <FolderPlus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject)}
            className={`w-full rounded-xl p-4 text-left transition ${
              selectedSubject?.id === subject.id
                ? "bg-purple-500 text-white"
                : "bg-black/30 text-gray-300"
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SubjectSidebar;