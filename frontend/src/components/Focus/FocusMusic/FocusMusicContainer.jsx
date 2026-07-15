import FocusMusic from "./FocusMusic";

import AmbientSounds from "../FocusMusic/Spotify/components/AmbientSounds";
import Footer from "../FocusMusic/Spotify/components/Footer";

import useAmbient from "./Spotify/hooks/useAmbient";
import useSpotifyPlayer from "./Spotify/hooks/useSpotifyPlayer";
import usePlayback from "./Spotify/hooks/usePlayback";

import useSpotify from "./Spotify/hooks/useSpotify";
import SpotifyConnection from "./Spotify/components/SpotifyConnection";

import PlaylistCarousel from "./Spotify/components/PlaylistCarousel";
import SpotifyPlayer from "./Spotify/components/SpotifyPlayer";

export default function FocusMusicContainer() {
  const spotify = useSpotify();

  const ambient = useAmbient();

  const player = useSpotifyPlayer();

  window.spotifyTest = player;

  const playback = usePlayback(player.deviceId);

  async function handlePlaylistSelect(playlist) {
    try {
      await spotify.selectPlaylist(playlist.id);

      await playback.play(playlist);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <FocusMusic
      spotifyActive={!!player.track && !player.paused}
      ambientActive={!!ambient.activeSound}
      spotifyConnected={!!spotify.spotify?.connected}
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
      player={<SpotifyPlayer player={player} spotify={spotify} playback={playback} />}
      playlists={
        <PlaylistCarousel
          loading={spotify.loading}
          playlists={spotify.playlists}
          selectedPlaylist={spotify.selectedPlaylist}
          selectingId={spotify.selectingId}
          onSelect={handlePlaylistSelect}
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
