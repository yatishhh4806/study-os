import { useEffect, useRef, useState } from "react";
import { api } from "../../../../../lib/api";
import { loadSpotifySDK } from "../services/loadSpotifySDK";

export default function useSpotifyPlayer() {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [ready, setReady] = useState(false);

  // Guards against React StrictMode's double-invoke of effects in dev.
  // Without this, two Spotify.Player instances get created back-to-back,
  // and a late "ready" event from the *first* (already-disconnected)
  // instance can overwrite deviceId with a dead device id.
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
          getOAuthToken: (cb) => cb(data.accessToken),
          volume: 0.5,
        });

        activePlayerRef.current = spotifyPlayer;

        spotifyPlayer.addListener("ready", async ({ device_id }) => {
          // Ignore stale events from a player instance that's no longer current
          if (cancelled || activePlayerRef.current !== spotifyPlayer) {
            console.log("Ignoring stale ready event:", device_id);
            return;
          }

          console.log("✅ Spotify Player Ready:", device_id);
          window.studyPlayerDevice = device_id;

          setDeviceId(device_id);
          setReady(true);

          await new Promise((resolve) => setTimeout(resolve, 2000));

          if (cancelled || activePlayerRef.current !== spotifyPlayer) return;

          try {
            const { data } = await api.get("/spotify/player");
            console.log("🎵 Current Player:", data);
          } catch (err) {
            console.error("GET PLAYER ERROR", err.response?.data || err);
          }

          try {
            await api.put("/spotify/player/transfer", { device_id });
            console.log("✅ Playback transferred");
          } catch (err) {
            console.error("Transfer failed", err);
          }
        });

        spotifyPlayer.addListener("not_ready", ({ device_id }) => {
          console.log("❌ Player Offline:", device_id);
          if (activePlayerRef.current === spotifyPlayer) {
            setReady(false);
          }
        });

        spotifyPlayer.addListener("initialization_error", console.error);
        spotifyPlayer.addListener("authentication_error", console.error);
        spotifyPlayer.addListener("account_error", console.error);

        await spotifyPlayer.connect();

        if (!cancelled) {
          setPlayer(spotifyPlayer);
        }
      } catch (err) {
        console.error(err);
      }
    }

    initialize();

    return () => {
      // Note: intentionally NOT disconnecting here on the StrictMode
      // phantom cleanup, since initializedRef prevents a second real
      // init anyway. If you need real unmount cleanup (e.g. navigating
      // away from the page), that's a separate concern — see note below.
      cancelled = true;
    };
  }, []);

  return { player, deviceId, ready };
}