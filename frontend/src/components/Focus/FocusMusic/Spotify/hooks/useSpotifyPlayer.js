import { useEffect, useRef, useState } from "react";
import { api } from "../../../../../lib/api";
import { loadSpotifySDK } from "../services/loadSpotifySDK";

export default function useSpotifyPlayer() {
  const [player, setPlayer] = useState(null);

  const [deviceId, setDeviceId] = useState(null);

  const [ready, setReady] = useState(false);

  // Track states
  const [track, setTrack] = useState(null);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Prevent React StrictMode double initialization
  const initializedRef = useRef(false);

  const activePlayerRef = useRef(null);

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    let cancelled = false;

    let spotifyPlayer;

    async function initialize() {
      try {
        await loadSpotifySDK();

        const { data } = await api.get("/spotify/token");

        spotifyPlayer = new window.Spotify.Player({
          name: "StudyOS Player",

          getOAuthToken: (cb) => {
            cb(data.accessToken);
          },

          volume: 0.5,
        });

        activePlayerRef.current = spotifyPlayer;

        /*
          Device ready
        */
        spotifyPlayer.addListener("ready", async ({ device_id }) => {
          if (cancelled || activePlayerRef.current !== spotifyPlayer) {
            console.log("Ignoring stale ready event:", device_id);

            return;
          }

          console.log("✅ Spotify Player Ready:", device_id);

          window.studyPlayerDevice = device_id;

          setDeviceId(device_id);

          setReady(true);

          // Allow Spotify to register device

          await new Promise((resolve) => setTimeout(resolve, 2000));

          if (cancelled || activePlayerRef.current !== spotifyPlayer) {
            return;
          }

          try {
            const { data } = await api.get("/spotify/player");

            console.log("🎵 Current Player:", data);
          } catch (err) {
            console.error("GET PLAYER ERROR", err.response?.data || err);
          }

          try {
            await api.put("/spotify/player/transfer", {
              device_id,
            });

            console.log("✅ Playback transferred");
          } catch (err) {
            console.error("Transfer failed", err);
          }
        });

        /*
          Track / Playback updates
        */
        spotifyPlayer.addListener("player_state_changed", (state) => {
          if (!state) return;

          setPaused(state.paused);

          setPosition(state.position);

          setDuration(state.duration);

          const currentTrack = state.track_window?.current_track;

          if (currentTrack) {
            setTrack({
              name: currentTrack.name,

              artist: currentTrack.artists?.[0]?.name,

              image: currentTrack.album?.images?.[0]?.url,
            });
          }
        });

        spotifyPlayer.addListener("not_ready", ({ device_id }) => {
          console.log("❌ Player Offline:", device_id);

          if (activePlayerRef.current === spotifyPlayer) {
            setReady(false);
          }
        });

        spotifyPlayer.addListener("initialization_error", (err) => {
          console.error("Initialization Error", err);
        });

        spotifyPlayer.addListener("authentication_error", (err) => {
          console.error("Authentication Error", err);
        });

        spotifyPlayer.addListener("account_error", (err) => {
          console.error("Account Error", err);
        });

        await spotifyPlayer.connect();

        if (!cancelled) {
          setPlayer(spotifyPlayer);
        }
      } catch (err) {
        console.error("Spotify Player Init Error", err);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    player,

    deviceId,

    ready,

    // playback data

    track,

    paused,

    position,

    duration,
  };
}
