import { useEffect, useState } from "react";
import { api } from "../../../../../lib/api";
import { loadSpotifySDK } from "../services/loadSpotifySDK";

export default function useSpotifyPlayer() {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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

        spotifyPlayer.addListener("ready", async ({ device_id }) => {
          console.log("✅ Spotify Player Ready:", device_id);

          setDeviceId(device_id);
          setReady(true);

          // Give Spotify a moment to register the device
          await new Promise((resolve) => setTimeout(resolve, 2000));
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

        spotifyPlayer.addListener("not_ready", ({ device_id }) => {
          console.log("❌ Player Offline:", device_id);

          setReady(false);
        });

        spotifyPlayer.addListener("initialization_error", console.error);
        spotifyPlayer.addListener("authentication_error", console.error);
        spotifyPlayer.addListener("account_error", console.error);

        await spotifyPlayer.connect();

        setPlayer(spotifyPlayer);
      } catch (err) {
        console.error(err);
      }
    }

    initialize();

    return () => {
      spotifyPlayer?.disconnect();
    };
  }, []);

  return {
    player,
    deviceId,
    ready,
  };
}
