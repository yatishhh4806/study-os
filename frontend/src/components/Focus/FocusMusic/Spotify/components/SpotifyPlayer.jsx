export default function SpotifyPlayer({
  player,
}) {

  const {
    ready,
    deviceId,
  } = player;


  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

      <h3 className="text-lg font-semibold text-white">
        Spotify Player
      </h3>


      <div className="mt-4 rounded-2xl bg-black/20 p-6 text-center">

        {
          ready ? (
            <>
              <p className="text-green-400">
                Player Connected
              </p>

              <p className="mt-2 text-sm text-white/40">
                Device ID:
              </p>

              <p className="break-all text-xs text-white/30">
                {deviceId}
              </p>
            </>
          ) : (
            <p className="text-white/40">
              Connecting Spotify Player...
            </p>
          )

        }

      </div>

    </div>
  );
}