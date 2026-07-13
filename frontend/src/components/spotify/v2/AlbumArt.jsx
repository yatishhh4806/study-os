import { Music2 } from "lucide-react";

export default function AlbumArt({ track, paused }) {
  const image = track?.album?.images?.[0]?.url;

  return (
    <div className="relative flex items-center justify-center">

      {/* Ambient Glow */}
      <div
        className={`spotify-glow absolute h-56 w-56 rounded-full bg-violet-500/20 blur-[90px] ${
          paused ? "opacity-60" : "opacity-100"
        }`}
      />

      {/* Reflection */}
      <div className="album-reflection absolute h-[190px] w-[190px] rounded-[26px]" />

      {image ? (
        <img
          src={image}
          alt={track.album.name}
          draggable={false}
          className={`relative z-10 h-[190px] w-[190px] rounded-[26px] border border-white/10 object-cover shadow-[0_20px_60px_rgba(0,0,0,.45)] transition-all duration-500 ${
            paused
              ? "scale-100"
              : "album-playing scale-[1.02]"
          } hover:scale-[1.04]`}
        />
      ) : (
        <div className="relative z-10 flex h-[190px] w-[190px] items-center justify-center rounded-[26px] border border-white/10 bg-gradient-to-br from-violet-500/20 to-violet-900/20">

          <Music2
            size={70}
            className="text-violet-300"
          />

        </div>
      )}

      {/* Decorative Ring */}
      <div className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/5" />

    </div>
  );
}