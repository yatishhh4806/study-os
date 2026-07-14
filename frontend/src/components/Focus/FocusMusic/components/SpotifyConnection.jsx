import { Loader2, LogOut, Music2 } from "lucide-react";

export default function SpotifyConnection({
  spotify,
  spotifyLoading,
  connecting,
  disconnecting,
  onConnect,
  onDisconnect,
}) {
  if (spotifyLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

        <div className="flex animate-pulse items-center gap-4">

          <div className="h-14 w-14 rounded-full bg-white/10" />

          <div className="flex-1 space-y-3">

            <div className="h-3 w-40 rounded-full bg-white/10" />

            <div className="h-3 w-24 rounded-full bg-white/10" />

          </div>

        </div>

      </div>
    );
  }

  if (!spotify.connected) {
    return (
      <button
        onClick={onConnect}
        disabled={connecting}
        className="group flex w-full items-center justify-center gap-3 rounded-3xl border border-violet-500/20 bg-violet-500/10 px-5 py-5 transition-all duration-300 hover:border-violet-400/40 hover:bg-violet-500/15"
      >
        {connecting ? (
          <Loader2
            size={18}
            className="animate-spin text-violet-300"
          />
        ) : (
          <Music2
            size={18}
            className="text-violet-300"
          />
        )}

        <span className="font-semibold text-white">
          Connect Spotify
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex items-center gap-4">

        {spotify.avatar ? (
          <img
            src={spotify.avatar}
            alt=""
            className="h-14 w-14 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10">

            <Music2
              size={20}
              className="text-violet-300"
            />

          </div>
        )}

        <div className="min-w-0 flex-1">

          <h3 className="truncate text-base font-bold text-white">
            {spotify.displayName}
          </h3>

          <div className="mt-1 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full rounded-full bg-emerald-400" />

            <span className="text-sm text-emerald-300">
              Connected
            </span>

          </div>

        </div>

        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-red-400/40 hover:bg-red-500/10"
        >
          {disconnecting ? (
            <Loader2
              size={17}
              className="animate-spin text-white"
            />
          ) : (
            <LogOut
              size={17}
              className="text-white/70"
            />
          )}
        </button>

      </div>

    </div>
  );
}