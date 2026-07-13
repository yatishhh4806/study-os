import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

let sdkLoadingPromise = null;

function loadSpotifySDK() {
  if (window.Spotify) {
    return Promise.resolve();
  }

  if (sdkLoadingPromise) {
    return sdkLoadingPromise;
  }

  sdkLoadingPromise = new Promise((resolve, reject) => {
    // Register callback BEFORE loading the SDK
    window.onSpotifyWebPlaybackSDKReady = () => {
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = reject;

    document.body.appendChild(script);
  });

  return sdkLoadingPromise;
}

export default function useSpotifyPlayer() {
  const playerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      await loadSpotifySDK();

      const { data } = await api.get("/spotify/me");

      if (!data.spotify.connected) return;

      const tokenRes = await api.get("/spotify/token");

      const spotifyAccessToken = tokenRes.data.accessToken;

      const player = new window.Spotify.Player({
        name: "StudyOS Player",

        getOAuthToken: (cb) => {
          cb(spotifyAccessToken);
        },

        volume: 0.6,
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }) => {
        if (!mounted) return;

        setReady(true);
        setDeviceId(device_id);

        console.log("Spotify Device:", device_id);
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

        lastTimestampRef.current = performance.now();
      });

      player.addListener("initialization_error", console.error);

      player.addListener("authentication_error", console.error);

      player.addListener("account_error", console.error);

      player.addListener("playback_error", console.error);

      await player.connect();
    }

    initialize();
    function animate(now) {
      setPosition((prev) => {
        if (paused) return prev;

        const delta = now - lastTimestampRef.current;

        lastTimestampRef.current = now;

        return Math.min(prev + delta, duration);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;

      cancelAnimationFrame(animationFrameRef.current);

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
}
}
