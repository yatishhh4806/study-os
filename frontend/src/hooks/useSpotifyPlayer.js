import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

let sdkPromise = null;

function loadSpotifySDK() {
  if (window.Spotify) return Promise.resolve();

  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = resolve;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = reject;

    document.body.appendChild(script);
  });

  return sdkPromise;
}

export default function useSpotifyPlayer() {
  const playerRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(performance.now());

  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [paused, setPaused] = useState(true);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await loadSpotifySDK();

        const profile = await api.get("/spotify/me");

        if (!profile.data.spotify.connected) return;

        const token = await api.get("/spotify/token");

        const player = new window.Spotify.Player({
          name: "StudyOS Player",

          getOAuthToken: (cb) => {
            cb(token.data.accessToken);
          },

          volume: 0.6,
        });

        playerRef.current = player;

        player.addListener("ready", ({ device_id }) => {
          if (!mounted) return;

          console.log("Spotify Device:", device_id);

          setReady(true);
          setDeviceId(device_id);
        });

        player.addListener("not_ready", ({ device_id }) => {
          console.log("Device Offline:", device_id);
        });

        player.addListener("player_state_changed", (state) => {
          if (!state) return;

          setPaused(state.paused);

          setPosition(state.position);

          setDuration(state.duration);

          setCurrentTrack(state.track_window.current_track);

          lastFrameRef.current = performance.now();
        });

        player.addListener("initialization_error", console.error);
        player.addListener("authentication_error", console.error);
        player.addListener("account_error", console.error);
        player.addListener("playback_error", console.error);

        await player.connect();
      } catch (err) {
        console.error(err);
      }
    }

    init();

    const animate = (time) => {
      setPosition((prev) => {
        if (paused) return prev;

        const delta = time - lastFrameRef.current;

        lastFrameRef.current = time;

        return Math.min(prev + delta, duration);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;

      cancelAnimationFrame(animationRef.current);

      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, []);

  return {
    player: playerRef.current,

    ready,

    deviceId,

    currentTrack,

    paused,

    position,

    duration,
  };
}