import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import GradeSelector from "../components/resources/GradeSelector";
import SubjectPicker from "../components/resources/SubjectPicker";
import RoadmapView from "../components/resources/RoadmapView";
import { fetchRoadmap, generateRoadmap } from "../services/resourceService";

function Resources() {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const existing = await fetchRoadmap();
        setRoadmap(existing);
      } catch (err) {
        console.error("Failed to load roadmap:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGenerate = async (subjects) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateRoadmap(selectedGrade, subjects);
      setRoadmap(result);
    } catch (err) {
      setError(
        err.response?.data?.error || "Couldn't generate your roadmap. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!roadmap) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateRoadmap(roadmap.grade, roadmap.selectedSubjects);
      setRoadmap(result);
    } catch (err) {
      setError(
        err.response?.data?.error || "Couldn't regenerate your roadmap. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09070f]">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09070f] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white">
            Study<span className="text-purple-400">Resources</span>
          </h1>
          <p className="mt-2 text-gray-400">
            Your personalized roadmap, timetable, and study links.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {roadmap ? (
          <RoadmapView
            roadmap={roadmap}
            onRegenerate={handleRegenerate}
            isGenerating={isGenerating}
          />
        ) : selectedGrade ? (
          <SubjectPicker
            grade={selectedGrade}
            onBack={() => setSelectedGrade(null)}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        ) : (
          <GradeSelector onSelect={setSelectedGrade} />
        )}
      </div>
    </div>
  );
}

export default Resources;