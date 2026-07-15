import { RefreshCw } from "lucide-react";
import PlaylistCard from "./PlaylistCard";
import PlaylistSkeleton from "./PlaylistSkeleton";

export default function PlaylistCarousel({
  loading,
  playlists,
  selectedPlaylist,
  selectingId,
  onSelect,
  onRefresh,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <PlaylistSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!playlists.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-white/60">
          No playlists found.
        </p>

        <p className="mt-2 text-sm text-white/40">
          Create or follow a playlist on Spotify.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">Playlists</span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white/80 active:scale-95 cursor-pointer disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            selected={selectedPlaylist?.id === playlist.id}
            selecting={selectingId === playlist.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}