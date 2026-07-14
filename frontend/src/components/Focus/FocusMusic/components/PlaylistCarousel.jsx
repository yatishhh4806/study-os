import { CheckCircle2, Loader2, Music2 } from "lucide-react";

export default function PlaylistCarousel({
  playlists = [],
  selectedPlaylist,
  selectingId,
  loading,
  onSelect,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />

        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 w-36 shrink-0 animate-pulse rounded-3xl bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!playlists.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-10 text-center text-white/45">
        No playlists available
      </div>
    );
  }

  return (
    <div>

      <div className="mb-5 flex items-center justify-between">

        <h3 className="text-lg font-semibold text-white">
          Quick Playlists
        </h3>

        <span className="text-xs uppercase tracking-[0.22em] text-white/35">
          {playlists.length} playlists
        </span>

      </div>

      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">

        {playlists.map((playlist) => {
          const selected = selectedPlaylist?.id === playlist.id;

          return (
            <button
              key={playlist.id}
              onClick={() => onSelect(playlist.id)}
              className={`group relative w-40 shrink-0 overflow-hidden rounded-3xl border transition-all duration-300 ${
                selected
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-violet-400/30 hover:bg-white/[0.05]"
              }`}
            >
              <div className="relative">

                {playlist.image ? (
                  <img
                    src={playlist.image}
                    alt={playlist.name}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-white/[0.04]">

                    <Music2
                      size={34}
                      className="text-white/30"
                    />

                  </div>
                )}

                {selected && (
                  <div className="absolute right-3 top-3 rounded-full bg-violet-500 p-1.5">

                    <CheckCircle2
                      size={16}
                      className="text-white"
                    />

                  </div>
                )}

                {selectingId === playlist.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55">

                    <Loader2
                      size={24}
                      className="animate-spin text-white"
                    />

                  </div>
                )}

              </div>

              <div className="p-4 text-left">

                <h4 className="truncate font-semibold text-white">
                  {playlist.name}
                </h4>

                <p className="mt-1 truncate text-xs text-white/45">
                  {playlist.trackCount} Tracks
                </p>

              </div>

            </button>
          );
        })}

      </div>

    </div>
  );
}