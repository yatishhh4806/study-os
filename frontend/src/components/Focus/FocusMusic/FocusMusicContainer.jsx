import FocusMusic from "./FocusMusic";

import AmbientSounds from "../FocusMusic/Spotify/components/AmbientSounds";
import Footer from "../FocusMusic/Spotify/components/Footer";

import useAmbient from "./Spotify/hooks/useAmbient";
import useSpotifyPlayer from "./Spotify/hooks/useSpotifyPlayer";

import useSpotify from "./Spotify/hooks/useSpotify";
import SpotifyConnection from "./Spotify/components/SpotifyConnection";

import PlaylistCarousel from "./Spotify/components/PlaylistCarousel";

export default function FocusMusicContainer() {
  const spotify = useSpotify();

  const ambient = useAmbient();

  const player = useSpotifyPlayer();

  console.log(player);

  return (
    <FocusMusic
      connection={
        <SpotifyConnection
          spotify={spotify.spotify}
          loading={spotify.loading}
          connecting={spotify.connecting}
          disconnecting={spotify.disconnecting}
          onConnect={spotify.connectSpotify}
          onDisconnect={spotify.disconnectSpotify}
        />
      }
      player={
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
          Spotify Player (Coming Soon)
        </div>
      }
      playlists={
        <PlaylistCarousel
          loading={spotify.loading}
          playlists={spotify.playlists}
          selectedPlaylist={spotify.selectedPlaylist}
          selectingId={spotify.selectingId}
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
