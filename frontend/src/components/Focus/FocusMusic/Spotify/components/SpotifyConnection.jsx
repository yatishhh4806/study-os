import { Music2, LogOut, Loader2 } from "lucide-react";

export default function SpotifyConnection({
  spotify,
  loading,
  connecting,
  disconnecting,
  onConnect,
  onDisconnect,
}) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="aspect-square rounded-2xl bg-white/10" />
        <div className="mt-4 h-5 w-3/4 rounded bg-white/10" />
        <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
      </div>
    );
  }

  if (spotify?.connected) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-20 blur-[70px]" />

        <div className="relative flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-violet-500/40">
            {spotify.avatar ? (
              <img
                src={spotify.avatar}
                alt={spotify.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.06]">
                <Music2 size={22} className="text-white/40" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">
              {spotify.displayName || "Spotify account"}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-emerald-400/90">
                Connected
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDisconnect}
            disabled={disconnecting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            {disconnecting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
          </button>
        </div>

        {spotify.selectedPlaylistName && (
          <div className="relative mt-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
            <p className="text-xs text-white/40">Active playlist</p>
            <p className="mt-0.5 truncate text-sm font-medium text-white">
              {spotify.selectedPlaylistName}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-2xl">
      <div className="pointer-events-none absolute -top-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-15 blur-[70px]" />

      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
        <Music2 size={26} className="text-violet-300" />
      </div>

      <h3 className="relative mt-4 text-base font-semibold text-white">
        Connect Spotify
      </h3>
      <p className="relative mt-1 text-sm text-white/50">
        Link your account to play focus playlists.
      </p>

      <button
        type="button"
        onClick={onConnect}
        disabled={connecting}
        className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
      >
        {connecting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Spotify"
        )}
      </button>
    </div>
  );
}