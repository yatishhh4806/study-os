import { Check, Music2 } from "lucide-react";

export default function PlaylistCard({
  playlist,
  selected,
  selecting,
  onSelect,
}) {
  return (
    <button
      type="button"
      disabled={selecting}
      onClick={() => onSelect(playlist.id)}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        selected
          ? "border-violet-500 bg-violet-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.05]"
      }`}
    >
      <div className="aspect-square overflow-hidden">
        {playlist.image ? (
          <img
            src={playlist.image}
            alt={playlist.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/[0.04]">
            <Music2
              size={42}
              className="text-white/30"
            />
          </div>
        )}
      </div>

      <div className="p-4 text-left">
        <h3 className="truncate font-semibold text-white">
          {playlist.name}
        </h3>

        <p className="mt-1 truncate text-sm text-white/50">
          {playlist.owner}
        </p>

        <p className="mt-2 text-xs text-white/40">
          {playlist.trackCount} Tracks
        </p>
      </div>

      {selected && (
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 shadow-lg">
          <Check
            size={18}
            className="text-white"
          />
        </div>
      )}
    </button>
  );
}