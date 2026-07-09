import { useEffect, useState } from "react";
import { X, Play, Link2, Loader2, ExternalLink } from "lucide-react";
import { searchResources } from "../../services/resourceService";

function SearchResultsModal({ query, subject, onClose }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ videos: [], notes: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await searchResources(query, subject);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setError("Couldn't load results right now. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, subject]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-purple-500/30 bg-[#0d0a16] p-6 shadow-2xl shadow-purple-500/10">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-purple-400">Real results for</p>
            <h3 className="text-xl font-bold text-white">{query}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-purple-400" size={28} />
          </div>
        )}

        {error && <p className="py-8 text-center text-sm text-red-300">{error}</p>}

        {!loading && !error && (
          <div className="space-y-8">
            <div>
              <div className="mb-3 flex items-center gap-2 text-white">
                <Play size={16} className="text-purple-400" />
                <h4 className="font-semibold">Videos & Playlists</h4>
              </div>
              {results.videos.length === 0 ? (
                <p className="text-sm text-gray-500">No video results found.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.videos.map((v, i) => (
                    <a
                      key={i}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 rounded-xl border border-purple-500/20 bg-white/5 p-3 transition hover:border-purple-500/50 hover:bg-purple-500/10"
                    >
                      {v.thumbnail && (
                        <img
                          src={v.thumbnail}
                          alt=""
                          className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-100 group-hover:text-purple-300">
                          {v.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {v.channel} · {v.type === "playlist" ? "Playlist" : "Video"}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-white">
                <Link2 size={16} className="text-purple-400" />
                <h4 className="font-semibold">Notes & Articles</h4>
              </div>
              {results.notes.length === 0 ? (
                <p className="text-sm text-gray-500">No note results found.</p>
              ) : (
                <div className="space-y-2">
                  {results.notes.map((n, i) => (
                    <a
                      key={i}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-purple-500/20 bg-white/5 p-3 transition hover:border-purple-500/50 hover:bg-purple-500/10"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-100 group-hover:text-purple-300">
                          {n.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {n.source} {n.snippet ? `· ${n.snippet.slice(0, 80)}...` : ""}
                        </p>
                      </div>
                      <ExternalLink
                        size={16}
                        className="ml-3 flex-shrink-0 text-gray-500 group-hover:text-purple-300"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResultsModal;