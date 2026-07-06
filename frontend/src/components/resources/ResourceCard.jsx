import {
  FileText,
  Youtube,
  Globe,
  BookOpen,
} from "lucide-react";

function ResourceCard({ resource }) {
  const getIcon = () => {
    switch (resource.type) {
      case "pdf":
        return <FileText className="text-red-400" />;

      case "youtube":
        return <Youtube className="text-red-500" />;

      case "website":
        return <Globe className="text-cyan-400" />;

      case "book":
        return <BookOpen className="text-purple-400" />;

      default:
        return <BookOpen />;
    }
  };

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl border border-white/10 bg-black/30 p-6 transition hover:border-purple-500/40 hover:bg-black/50"
    >
      <div className="mb-5">
        {getIcon()}
      </div>

      <h3 className="text-lg font-bold text-white">
        {resource.title}
      </h3>

      <p className="mt-2 capitalize text-gray-400">
        {resource.type}
      </p>
    </a>
  );
}

export default ResourceCard;