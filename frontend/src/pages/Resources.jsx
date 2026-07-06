import { useState } from "react";
import {
  FolderPlus,
  Plus,
  FileText,
  SquarePlay,
  Globe,
  BookOpen,
  Star,
} from "lucide-react";

const initialSubjects = [
  {
    id: 1,
    name: "DSA",
    resources: [
      {
        id: 1,
        title: "Striver A2Z Sheet",
        type: "website",
        link: "https://takeuforward.org",
      },
      {
        id: 2,
        title: "Graph Theory Notes",
        type: "pdf",
        link: "#",
      },
    ],
  },
];

function Resources() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [selectedSubject, setSelectedSubject] = useState(
    initialSubjects[0]
  );

  const addSubject = () => {
    const name = prompt("Enter subject name");

    if (!name) return;

    const newSubject = {
      id: Date.now(),
      name,
      resources: [],
    };

    setSubjects([...subjects, newSubject]);
    setSelectedSubject(newSubject);
  };

  const addResource = () => {
    const title = prompt("Resource title");
    const type = prompt(
      "Type (pdf, youtube, website, book)"
    );
    const link = prompt("Link");

    if (!title || !type) return;

    const updated = subjects.map((subject) => {
      if (subject.id === selectedSubject.id) {
        return {
          ...subject,
          resources: [
            ...subject.resources,
            {
              id: Date.now(),
              title,
              type,
              link,
            },
          ],
        };
      }
      return subject;
    });

    setSubjects(updated);

    setSelectedSubject(
      updated.find(
        (subject) => subject.id === selectedSubject.id
      )
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="text-red-400" />;

      case "youtube":
        return <SquarePlay className="text-red-500" />;

      case "website":
        return <Globe className="text-cyan-400" />;

      case "book":
        return <BookOpen className="text-purple-400" />;

      default:
        return <Star />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09070f] p-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

        {/* Sidebar */}
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
                onClick={() =>
                  setSelectedSubject(subject)
                }
                className={`w-full rounded-xl p-4 text-left transition ${
                  selectedSubject.id === subject.id
                    ? "bg-purple-500 text-white"
                    : "bg-black/30 text-gray-300"
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="rounded-3xl border border-purple-500/20 bg-black/40 p-8 backdrop-blur-xl">

          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white">
                {selectedSubject.name}
              </h1>

              <p className="mt-2 text-gray-400">
                Store PDFs, books, videos and
                websites.
              </p>
            </div>

            <button
              onClick={addResource}
              className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white"
            >
              <Plus size={18} />
              Add Resource
            </button>
          </div>

          {/* Resources */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {selectedSubject.resources.map(
              (resource) => (
                <a
                  key={resource.id}
                  href={resource.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-white/10 bg-black/30 p-6 transition hover:border-purple-500/40 hover:bg-black/50"
                >
                  <div className="mb-5">
                    {getIcon(resource.type)}
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {resource.title}
                  </h3>

                  <p className="mt-2 capitalize text-gray-400">
                    {resource.type}
                  </p>
                </a>
              )
            )}

            {/* Empty State */}
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
                  Add PDFs, videos, books or
                  websites.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;