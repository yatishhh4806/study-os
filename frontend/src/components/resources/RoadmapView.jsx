import { useState, useMemo } from "react";
import {
  RefreshCw,
  BookOpen,
  Calendar,
  Link2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import SearchResultsModal from "./SearchResultsModal";

// deterministic accent color per subject, so switching subjects re-themes
// the whole panel instead of everything staying purple/flat
const ACCENTS = ["#a855f7", "#22d3ee", "#f472b6", "#fb923c", "#34d399", "#facc15"];
function accentFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

function RoadmapView({ roadmap, onRegenerate, onChangeGrade, isGenerating }) {
  const [activeSearch, setActiveSearch] = useState(null);
  const [activeTab, setActiveTab] = useState("timetable");
  const [activeSubjectName, setActiveSubjectName] = useState(
    roadmap.subjects?.[0]?.name || null,
  );

  const activeSubject = useMemo(
    () => roadmap.subjects?.find((s) => s.name === activeSubjectName),
    [roadmap.subjects, activeSubjectName],
  );
  const accent = accentFor(activeSubject?.name);

  const hasTimetable = roadmap.timetable?.length > 0;
  const hasSubjects = roadmap.subjects?.length > 0;
  const hasSidebar = roadmap.subjects?.length > 1;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-xl">
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
            <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Regenerating..." : "Regenerate"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-white/5 bg-black/20 p-1.5">
        {hasTimetable && (
          <button
            onClick={() => setActiveTab("timetable")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "timetable"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Calendar size={15} />
            Weekly Timetable
          </button>
        )}
        {hasSubjects && (
          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "subjects"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BookOpen size={15} />
            Subject Roadmaps
          </button>
        )}
      </div>

      {/* ── Timetable tab ── */}
      {activeTab === "timetable" && hasTimetable && (
        <div className="w-full rounded-3xl border border-purple-500/20 bg-black/40 p-6 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-purple-500/20 text-gray-400">
                  <th className="pb-3 pr-4">Day</th>
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 pr-4">Duration</th>
                  <th className="pb-3">Focus</th>
                </tr>
              </thead>
              <tbody>
                {roadmap.timetable.map((row, i) => {
                  const isRest = row.subject?.toLowerCase() === "rest";
                  const rowAccent = accentFor(row.subject);
                  return (
                    <tr
                      key={i}
                      className={`border-b border-white/5 transition hover:bg-white/2 ${
                        isRest ? "text-gray-500" : "text-gray-200"
                      }`}
                    >
                      <td className="py-3 pr-4 font-medium">{row.day}</td>
                      <td className="py-3 pr-4">
                        {isRest ? (
                          <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs">
                            Rest
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: rowAccent, boxShadow: `0 0 6px ${rowAccent}` }}
                            />
                            {row.subject}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{row.duration}</td>
                      <td className="py-3 text-gray-400">{row.focus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Subjects tab ── */}
      {activeTab === "subjects" && hasSubjects && (
        <div className={`grid w-full gap-6 ${hasSidebar ? "lg:grid-cols-[240px_1fr]" : "grid-cols-1"}`}>
          {hasSidebar && (
            <div className="h-fit space-y-2 rounded-3xl border border-purple-500/20 bg-black/40 p-4 backdrop-blur-xl">
              {roadmap.subjects.map((s) => {
                const active = s.name === activeSubjectName;
                const c = accentFor(s.name);
                return (
                  <button
                    key={s.name}
                    onClick={() => setActiveSubjectName(s.name)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition"
                    style={{
                      background: active ? `${c}22` : "transparent",
                      border: `1px solid ${active ? c + "55" : "transparent"}`,
                      color: active ? "#fff" : "#9ca3af",
                    }}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: c, boxShadow: active ? `0 0 6px ${c}` : "none" }}
                      />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <ChevronRight size={14} style={{ opacity: active ? 1 : 0, color: c }} />
                  </button>
                );
              })}
            </div>
          )}

          {activeSubject && (
            <div
              className="w-full min-w-0 rounded-3xl border p-6 backdrop-blur-xl"
              style={{
                borderColor: `${accent}30`,
                background: `linear-gradient(180deg, ${accent}0d, rgba(0,0,0,0.4))`,
              }}
            >
              {/* Subject header with progress */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}
                  >
                    <BookOpen size={20} style={{ color: accent }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{activeSubject.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
                      {activeSubject.topics?.length || 0} topics planned
                    </p>
                  </div>
                </div>
              </div>

              {activeSubject.notes && (
                <div
                  className="mb-6 flex gap-3 rounded-2xl border p-4"
                  style={{ borderColor: `${accent}25`, background: `${accent}0a` }}
                >
                  <Sparkles size={16} className="mt-0.5 shrink-0" style={{ color: accent }} />
                  <p className="text-sm italic leading-relaxed text-gray-300">
                    {activeSubject.notes}
                  </p>
                </div>
              )}

              {/* Timeline — replaces the flat stacked boxes with a
                  connected-line timeline, same visual language as the
                  Dashboard's "Today's Schedule" widget */}
              {activeSubject.topics?.length > 0 && (
                <div className="relative pl-6">
                  <div
                    className="absolute bottom-2 left-2.25 top-2 w-px"
                    style={{ background: `${accent}30` }}
                  />
                  <div className="space-y-4">
                    {activeSubject.topics.map((topic, i) => (
                      <div key={i} className="group relative">
                        <div
                          className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2"
                          style={{ borderColor: accent, background: "#09070f" }}
                        />
                        <div
                          className="rounded-2xl border border-white/5 bg-white/3 p-4 transition group-hover:border-white/10 group-hover:bg-white/5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-gray-100">
                              {topic.title}
                            </span>
                            <span
                              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                              style={{ background: `${accent}22`, color: accent }}
                            >
                              Week {topic.week}
                            </span>
                          </div>
                          {topic.description && (
                            <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSubject.resourceSuggestions?.length > 0 && (
                <div className="mt-6 border-t pt-5" style={{ borderColor: `${accent}20` }}>
                  <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <Link2 size={14} />
                    Find resources
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeSubject.resourceSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setActiveSearch({ query: s, subject: activeSubject.name })
                        }
                        className="rounded-lg border px-3 py-1.5 text-xs text-gray-300 transition hover:text-white"
                        style={{ borderColor: `${accent}30`, background: `${accent}0a` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = `${accent}22`)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = `${accent}0a`)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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