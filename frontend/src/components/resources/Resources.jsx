import { useState } from "react";
import { Plus } from "lucide-react";

import SubjectSidebar from
"../components/resources/SubjectSidebar";

import ResourceGrid from
"../components/resources/ResourceGrid";

const initialSubjects = [
  {
    id: 1,
    name: "DSA",
    resources: [],
  },
];

function Resources() {
  const [subjects, setSubjects] =
    useState(initialSubjects);

  const [selectedSubject,
    setSelectedSubject] =
    useState(initialSubjects[0]);

  const addSubject = () => {
    const name = prompt(
      "Enter subject name"
    );

    if (!name) return;

    const newSubject = {
      id: Date.now(),
      name,
      resources: [],
    };

    setSubjects([
      ...subjects,
      newSubject,
    ]);

    setSelectedSubject(
      newSubject
    );
  };

  const addResource = () => {
    // modal later
  };

  return (
    <div className="min-h-screen bg-[#09070f] p-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

        <SubjectSidebar
          subjects={subjects}
          selectedSubject={
            selectedSubject
          }
          setSelectedSubject={
            setSelectedSubject
          }
          addSubject={
            addSubject
          }
        />

        <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-8">
          <div className="mb-10 flex items-center justify-between">

            <div>
              <h1 className="text-4xl font-black text-white">
                {
                  selectedSubject?.name
                }
              </h1>

              <p className="mt-2 text-gray-400">
                Store PDFs,
                videos,
                books and websites.
              </p>
            </div>

            <button
              onClick={
                addResource
              }
              className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white"
            >
              <Plus size={18} />
              Add Resource
            </button>
          </div>

          <ResourceGrid
            selectedSubject={
              selectedSubject
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Resources;