import { useEffect, useRef, useState } from "react";
import { api } from "../../../../lib/api";

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
      } catch (err) {
        console.error(err);
      }
    }

    init();

    return () => {
      mounted = false;
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
