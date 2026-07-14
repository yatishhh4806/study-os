let sdkPromise = null;

export function loadSpotifySDK() {
  if (window.Spotify) {
    return Promise.resolve(window.Spotify);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      resolve(window.Spotify);
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    script.onerror = () => reject(new Error("Spotify SDK failed to load"));

    document.body.appendChild(script);
  });

  return sdkPromise;
}