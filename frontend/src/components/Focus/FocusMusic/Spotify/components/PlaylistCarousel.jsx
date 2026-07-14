import PlaylistCard from "./PlaylistCard";
import PlaylistSkeleton from "./PlaylistSkeleton";

export default function PlaylistCarousel({
  loading,
  playlists,
  selectedPlaylist,
  selectingId,
  onSelect,
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
  );
}