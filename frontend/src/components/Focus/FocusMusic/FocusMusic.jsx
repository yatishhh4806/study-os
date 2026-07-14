import { Music2 } from "lucide-react";
import "./FocusMusic";

export default function FocusMusic({
  connection,
  player,
  playlists,
  ambient,
  footer,
}) {
  return (
    <section className="focus-music-card">

      {/* Background Glow */}

      <div className="focus-music-glow" />

      {/* Header */}

      <header className="focus-music-header">

        <div>

          <div className="focus-music-label">

            <Music2
              size={17}
              className="text-violet-400"
            />

            <span>
              Focus Music
            </span>

          </div>

          <h2>
            Your soundtrack for deep work
          </h2>

          <p>
            Stay immersed while you study.
          </p>

        </div>

        <div className="focus-music-premium">

          Spotify Premium

        </div>

      </header>

      {/* Spotify Connection */}

      <section>

        {connection}

      </section>

      {/* Player */}

      <section>

        {player}

      </section>

      {/* Playlists */}

      <section>

        {playlists}

      </section>

      {/* Ambient */}

      <section>

        {ambient}

      </section>

      {/* Footer */}

      <footer>

        {footer}

      </footer>

    </section>
  );
}