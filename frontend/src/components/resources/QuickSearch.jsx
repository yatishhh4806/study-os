import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import SearchResultsModal from "./SearchResultsModal";

function QuickSearch() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveQuery(query.trim());
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="mb-8 flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-black/40 p-3 backdrop-blur-xl"
      >
        <Sparkles size={18} className="ml-2 flex-shrink-0 text-purple-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything — e.g. 'binary search trees', 'organic chemistry basics'..."
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:opacity-90"
        >
          <Search size={16} />
          Find Resources
        </button>
      </form>

      {activeQuery && (
        <SearchResultsModal query={activeQuery} onClose={() => setActiveQuery(null)} />
      )}
    </>
  );
}

export default QuickSearch;