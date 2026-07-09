import { useState } from "react";
import { RefreshCw, BookOpen, Calendar, Link2 } from "lucide-react";
import SearchResultsModal from "./SearchResultsModal";

function RoadmapView({ roadmap, onRegenerate, onChangeGrade, isGenerating }) {
  const [activeSearch, setActiveSearch] = useState(null); // { query, subject }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold text-white">{roadmap.grade}</h2>
          <p className="mt-1 text-sm text-gray-400">
            {roadmap.selectedSubjects?.join(" • ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onChangeGrade}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-purple-500/40 hover:text-purple-200"
          >
            Change Grade/Subjects
          </button>
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20 disabled:opacity-40"
          >
            <RefreshCw
              size={16}
              className={isGenerating ? "animate-spin" : ""}
            />
            {isGenerating ? "Regenerating..." : "Regenerate"}
          </button>
        </div>
      </div>

      {roadmap.timetable?.length > 0 && (
        <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Calendar size={18} className="text-purple-400" />
            <h3 className="text-lg font-semibold">Weekly Timetable</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-purple-500/20 text-gray-400">
                  <th className="pb-2 pr-4">Day</th>
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4">Duration</th>
                  <th className="pb-2">Focus</th>
                </tr>
              </thead>
              <tbody>
                {roadmap.timetable.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 text-gray-200">
                    <td className="py-2 pr-4 font-medium">{row.day}</td>
                    <td className="py-2 pr-4">{row.subject}</td>
                    <td className="py-2 pr-4 text-gray-400">{row.duration}</td>
                    <td className="py-2 text-gray-400">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {roadmap.subjects?.map((subject) => (
          <div
            key={subject.name}
            className="rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-white">
              <BookOpen size={18} className="text-purple-400" />
              <h3 className="text-lg font-semibold">{subject.name}</h3>
            </div>

            {subject.notes && (
              <p className="mb-4 text-sm italic text-gray-400">
                {subject.notes}
              </p>
            )}

            <div className="space-y-3">
              {subject.topics?.map((topic, i) => (
                <div key={i} className="rounded-xl bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-100">
                      {topic.title}
                    </span>
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                      Week {topic.week}
                    </span>
                  </div>
                  {topic.description && (
                    <p className="mt-1 text-xs text-gray-400">
                      {topic.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {subject.resourceSuggestions?.length > 0 && (
              <div className="mt-4 border-t border-purple-500/10 pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <Link2 size={14} />
                  Find resources
                </div>
                <div className="flex flex-wrap gap-2">
                  {subject.resourceSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setActiveSearch({ query: s, subject: subject.name })
                      }
                      className="rounded-lg border border-purple-500/20 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeSearch && (
        <SearchResultsModal
          query={activeSearch.query}
          subject={activeSearch.subject}
          onClose={() => setActiveSearch(null)}
        />
      )}
    </div>
  );
}

export default RoadmapView;
