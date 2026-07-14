export default function SpotifyPlayer({ player }) {
  const { ready, track, paused } = player;

  return (
    <div
      className="
rounded-3xl
border
border-white/10
bg-white/[0.03]
p-6
"
    >
      <h3
        className="
text-lg
font-semibold
text-white
"
      >
        Spotify Player
      </h3>

      <div
        className="
mt-5
rounded-2xl
bg-black/20
p-5
"
      >
        {track ? (
          <div>
            <img
              src={track.image}
              className="
mx-auto
h-40
w-40
rounded-xl
object-cover
"
            />

            <h2
              className="
mt-4
text-center
text-white
font-semibold
"
            >
              {track.name}
            </h2>

            <p
              className="
text-center
text-white/50
"
            >
              {track.artist}
            </p>

            <p
              className="
mt-3
text-center
text-violet-400
"
            >
              {paused ? "Paused" : "Playing"}
            </p>
          </div>
        ) : (
          <p
            className="
text-center
text-white/40
"
          >
            Play a playlist to see track
          </p>
        )}
      </div>
    </div>
  );
}
