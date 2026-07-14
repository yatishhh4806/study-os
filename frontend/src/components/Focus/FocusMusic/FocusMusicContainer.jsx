import FocusMusic from "./FocusMusic";
import SpotifyConnection from "./components/SpotifyConnection";
import PlaylistCarousel from "./components/PlaylistCarousel";
import AmbientSounds from "./components/AmbientSounds";
import Footer from "./components/Footer";
import useSpotifyPlayer from "./hooks/useSpotifyPlayer";

import useSpotify from "./hooks/useSpotify";
import useAmbient from "./hooks/useAmbient";

export default function FocusMusicContainer() {
  const spotify = useSpotify();

  const ambient = useAmbient();

  const player = useSpotifyPlayer();

  return (
    <FocusMusic
      connection={
        <SpotifyConnection
          spotify={spotify.spotify}
          spotifyLoading={spotify.spotifyLoading}
          connecting={spotify.connecting}
          disconnecting={spotify.disconnecting}
          onConnect={spotify.connectSpotify}
          onDisconnect={spotify.disconnectSpotify}
        />
      }
      player={
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
          Spotify Player (Next Step)
        </div>
      }
      playlists={
        <PlaylistCarousel
          playlists={spotify.playlists}
          selectedPlaylist={spotify.selectedPlaylist}
          selectingId={spotify.selectingId}
          loading={spotify.playlistLoading}
          onSelect={spotify.selectPlaylist}
        />
      }
      ambient={
        <AmbientSounds
          sounds={ambient.sounds}
          activeSound={ambient.activeSound}
          onToggle={ambient.toggleSound}
        />
      }
      footer={<Footer spotifyConnected={spotify.spotify.connected} />}
    />
  );
}
