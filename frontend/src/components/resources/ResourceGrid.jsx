import { BookOpen } from "lucide-react";
import ResourceCard from "./ResourceCard";

function ResourceGrid({ selectedSubject }) {
  if (!selectedSubject)
    return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

      {selectedSubject.resources.map(
        (resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
          />
        )
      )}

      {selectedSubject.resources.length ===
        0 && (
        <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-purple-500/30">
          <BookOpen
            size={40}
            className="text-purple-400"
          />

          <h2 className="mt-4 text-xl font-bold text-white">
            No resources yet
          </h2>

          <p className="mt-2 text-gray-400">
            Add PDFs, books, websites or
            videos.
          </p>
        </div>
      )}
    </div>
  );
}

export default ResourceGrid;