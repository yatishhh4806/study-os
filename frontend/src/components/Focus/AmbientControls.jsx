import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CloudRain,
  Coffee,
  Flame,
  Loader2,
  LogOut,
  Music2,
  Sparkles,
  Trees,
  Volume2,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEYS = {
  sound: "studyos:ambient:sound",
  volume: "studyos:ambient:volume",
  playlistId: "studyos:spotify:selectedPlaylistId",
  playlistName: "studyos:spotify:selectedPlaylistName",
};

const SOUNDS = [
  { key: "rain", label: "Rain", icon: CloudRain, file: "/audio/rain.mp3" },
  { key: "cafe", label: "Cafe", icon: Coffee, file: "/audio/cafe.mp3" },
  { key: "forest", label: "Forest", icon: Trees, file: "/audio/forest.mp3" },
  { key: "fireplace", label: "Fireplace", icon: Flame, file: "/audio/fireplace.mp3" },
  { key: "lofi", label: "Lofi", icon: Music2, file: "/audio/lofi.mp3" },
];

function safeLocalStorageGet(key, fallback = null) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    if (value === null || value === undefined || value === "") window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(value));
  } catch {
    // localStorage can be unavailable in strict privacy modes.
  }
}

function PlaylistSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex animate-pulse gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
        >
          <div className="h-14 w-14 rounded-xl bg-white/10" />
          <div className="min-w-0 flex-1 space-y-2 py-1">
            <div className="h-3 w-3/4 rounded-full bg-white/10" />
            <div className="h-3 w-1/2 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;

  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;
  const color = toast.type === "error" ? "#fb7185" : "#a855f7";

  return (
    <div className="ambient-toast fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#15111c]/95 px-4 py-2.5 text-sm text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <Icon size={16} color={color} />
      <span>{toast.message}</span>
    </div>
  );
}

export default function AmbientPanel() {
  const { refreshUser } = useAuth();
  const audioRef = useRef(null);
  const toastTimerRef = useRef(null);

  const savedVolume = Number(safeLocalStorageGet(STORAGE_KEYS.volume, "55"));
  const [activeSound, setActiveSound] = useState(() => safeLocalStorageGet(STORAGE_KEYS.sound, null));
  const [activeSource, setActiveSource] = useState(activeSound ? "ambient" : null);
  const [volume, setVolume] = useState(Number.isFinite(savedVolume) ? savedVolume : 55);
  const [spotify, setSpotify] = useState({ connected: false });
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(() => {
    const id = safeLocalStorageGet(STORAGE_KEYS.playlistId);
    const name = safeLocalStorageGet(STORAGE_KEYS.playlistName);
    return id ? { id, name } : null;
  });
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [selectingId, setSelectingId] = useState(null);
  const [spotifyPlayerKey, setSpotifyPlayerKey] = useState(0);
  const [toast, setToast] = useState(null);

  const accent = "#a855f7";
  const glow = "rgba(168,85,247,0.5)";

  const soundByKey = useMemo(
    () => new Map(SOUNDS.map((sound) => [sound.key, sound])),
    [],
  );

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const stopAmbient = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setActiveSound(null);
    safeLocalStorageSet(STORAGE_KEYS.sound, null);
  }, []);

  const loadPlaylists = useCallback(async () => {
    setPlaylistLoading(true);
    try {
      const { data } = await api.get("/spotify/playlists");
      setPlaylists(data.playlists || []);

      if (data.selectedPlaylistId) {
        const selected = {
          id: data.selectedPlaylistId,
          name: data.selectedPlaylistName,
        };
        setSelectedPlaylist(selected);
        safeLocalStorageSet(STORAGE_KEYS.playlistId, selected.id);
        safeLocalStorageSet(STORAGE_KEYS.playlistName, selected.name);
      }
    } catch (err) {
      console.error("Failed to load Spotify playlists:", err);
      showToast(err.response?.data?.error || "Could not load Spotify playlists", "error");
    } finally {
      setPlaylistLoading(false);
    }
  }, [showToast]);

  const loadSpotify = useCallback(async () => {
    setSpotifyLoading(true);
    try {
      const { data } = await api.get("/spotify/me");
      setSpotify(data.spotify);

      if (data.spotify?.selectedPlaylistId) {
        setSelectedPlaylist({
          id: data.spotify.selectedPlaylistId,
          name: data.spotify.selectedPlaylistName,
        });
        safeLocalStorageSet(STORAGE_KEYS.playlistId, data.spotify.selectedPlaylistId);
        safeLocalStorageSet(STORAGE_KEYS.playlistName, data.spotify.selectedPlaylistName);
      }

      if (data.spotify?.connected) {
        await loadPlaylists();
      }
    } catch (err) {
      console.error("Failed to load Spotify profile:", err);
      showToast(err.response?.data?.error || "Could not load Spotify", "error");
    } finally {
      setSpotifyLoading(false);
    }
  }, [loadPlaylists, showToast]);

  useEffect(() => {
    loadSpotify();
  }, [loadSpotify]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("spotify");
    const message = params.get("message");

    if (!status) return;

    if (status === "connected") {
      showToast("Spotify connected");
      refreshUser?.();
      loadSpotify();
    } else if (status === "error") {
      showToast(message || "Spotify connection failed", "error");
    }

    params.delete("spotify");
    params.delete("message");
    const nextSearch = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`,
    );
  }, [loadSpotify, refreshUser, showToast]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.volume, volume);
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (!activeSound) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      return;
    }

    const sound = soundByKey.get(activeSound);
    if (!sound) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(sound.file);
    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.error("Ambient audio could not start:", err);
      setActiveSound(null);
      safeLocalStorageSet(STORAGE_KEYS.sound, null);
      showToast("Tap again to start ambient audio", "error");
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [activeSound, soundByKey, volume, showToast]);

  useEffect(() => {
    return () => {
      clearTimeout(toastTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const toggleSound = (key) => {
    if (activeSound === key) {
      stopAmbient();
      setActiveSource(null);
      return;
    }

    setSpotifyPlayerKey((prev) => prev + 1);
    setActiveSource("ambient");
    setActiveSound(key);
    safeLocalStorageSet(STORAGE_KEYS.sound, key);
  };

  const connectSpotify = async () => {
    setConnecting(true);
    try {
      const { data } = await api.get("/spotify/login");
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      console.error("Spotify login failed:", err);
      showToast(err.response?.data?.error || "Could not start Spotify login", "error");
      setConnecting(false);
    }
  };

  const disconnectSpotify = async () => {
    setDisconnecting(true);
    try {
      await api.delete("/spotify/disconnect");
      setSpotify({ connected: false });
      setPlaylists([]);
      setSelectedPlaylist(null);
      setActiveSource(activeSound ? "ambient" : null);
      safeLocalStorageSet(STORAGE_KEYS.playlistId, null);
      safeLocalStorageSet(STORAGE_KEYS.playlistName, null);
      await refreshUser?.();
      showToast("Spotify disconnected");
    } catch (err) {
      console.error("Spotify disconnect failed:", err);
      showToast(err.response?.data?.error || "Could not disconnect Spotify", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  const selectPlaylist = async (playlistId) => {
    setSelectingId(playlistId);
    try {
      const { data } = await api.get(`/spotify/playlists/${playlistId}`);
      const playlist = data.playlist;
      setSelectedPlaylist({ id: playlist.id, name: playlist.name });
      setActiveSource("spotify");
      stopAmbient();
      safeLocalStorageSet(STORAGE_KEYS.playlistId, playlist.id);
      safeLocalStorageSet(STORAGE_KEYS.playlistName, playlist.name);
      setSpotifyPlayerKey((prev) => prev + 1);
      await refreshUser?.();
      showToast("Playlist selected");
    } catch (err) {
      console.error("Spotify playlist select failed:", err);
      showToast(err.response?.data?.error || "Could not select playlist", "error");
    } finally {
      setSelectingId(null);
    }
  };

  const selectedPlaylistName =
    selectedPlaylist?.name ||
    playlists.find((playlist) => playlist.id === selectedPlaylist?.id)?.name ||
    "Selected playlist";

  const embedUrl = selectedPlaylist?.id
    ? `https://open.spotify.com/embed/playlist/${encodeURIComponent(selectedPlaylist.id)}?utm_source=generator`
    : null;

  return (
    <div className="w-full font-sans">
      <style>{`
        @keyframes ambientFadeUp { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform: translateY(0);} }
        @keyframes ambientBarPulse { 0%,100% { transform: scaleY(0.4);} 50% { transform: scaleY(1);} }
        @keyframes ambientToastIn { from { opacity:0; transform: translate(-50%, 10px);} to { opacity:1; transform: translate(-50%, 0);} }
        .ambient-card { animation: ambientFadeUp 0.5s ease both; }
        .ambient-row { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .ambient-row:hover { transform: translateX(2px); border-color: rgba(168,85,247,0.35) !important; background: rgba(168,85,247,0.07) !important; }
        .ambient-row:active { transform: translateX(2px) scale(0.99); }
        .ambient-eq { transform-origin: bottom; animation: ambientBarPulse 0.9s ease-in-out infinite; }
        .ambient-toast { animation: ambientToastIn 0.25s ease-out both; }
        input[type="range"].ambient-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          outline: none;
          background: linear-gradient(to right, ${accent} var(--val,55%), rgba(255,255,255,0.1) var(--val,55%));
        }
        input[type="range"].ambient-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 4px ${glow}, 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        input[type="range"].ambient-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type="range"].ambient-slider::-moz-range-thumb {
          width: 18px; height: 18px; border: none; border-radius: 50%;
          background: #fff; box-shadow: 0 0 0 4px ${glow}, 0 2px 8px rgba(0,0,0,0.4); cursor: pointer;
        }
      `}</style>

      <div
        className="ambient-card rounded-[24px] border border-purple-500/20 bg-linear-to-b from-[#140e1c]/85 to-[#08060c]/95 p-6 pb-8 shadow-2xl shadow-black/60 backdrop-blur-2xl"
        style={{
          borderLeft: `2px solid ${accent}`,
          boxShadow: `0 30px 60px -25px rgba(0,0,0,0.65), -10px 0 40px -20px ${glow}`,
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Ambient</h2>
            <p className="mt-1 text-xs font-medium text-white/40">
              {activeSource === "spotify" ? "Spotify focus stream" : activeSound ? "Ambient sound active" : "Choose a focus layer"}
            </p>
          </div>
          <Sparkles size={18} color={accent} />
        </div>

        <div className="mb-6 flex flex-col gap-2.5">
          {SOUNDS.map(({ key, label, icon: Icon }) => {
            const isActive = activeSound === key;
            return (
              <button
                key={key}
                className="ambient-row flex items-center gap-3 rounded-2xl border p-3.5 text-left"
                onClick={() => toggleSound(key)}
                style={{
                  borderColor: isActive ? accent : "rgba(255,255,255,0.08)",
                  background: isActive ? "rgba(168,85,247,0.13)" : "rgba(255,255,255,0.025)",
                  boxShadow: isActive ? `0 0 22px -8px ${glow}` : "none",
                }}
              >
                <Icon size={17} color={isActive ? accent : "rgba(255,255,255,0.5)"} />
                <span className={`min-w-0 flex-1 text-[15px] font-medium ${isActive ? "text-white" : "text-white/80"}`}>
                  {label}
                </span>
                {isActive && (
                  <span className="flex h-4 items-end gap-0.5">
                    {[0, 1, 2].map((bar) => (
                      <span
                        key={bar}
                        className="ambient-eq block h-3.5 w-[3px] rounded-full"
                        style={{ background: accent, animationDelay: `${bar * 0.15}s` }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white/50">
              <Volume2 size={15} />
              Volume
            </span>
            <span className="text-[13px] font-bold" style={{ color: accent }}>
              {volume}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="ambient-slider w-full"
            style={{ "--val": `${volume}%` }}
          />
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">Spotify</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {spotifyLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex animate-pulse items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded-full bg-white/10" />
                <div className="h-3 w-1/3 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        ) : !spotify.connected ? (
          <button
            onClick={connectSpotify}
            disabled={connecting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/15 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/10 transition hover:border-purple-400/60 hover:bg-purple-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {connecting ? <Loader2 size={17} className="animate-spin" /> : <Music2 size={17} />}
            Connect Spotify
          </button>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                {spotify.avatar ? (
                  <img
                    src={spotify.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/20">
                    <Music2 size={19} color={accent} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{spotify.displayName || "Spotify"}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Connected
                  </p>
                </div>
                <button
                  onClick={disconnectSpotify}
                  disabled={disconnecting}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-50"
                  title="Disconnect Spotify"
                >
                  {disconnecting ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">My Playlists</h3>
                <button
                  onClick={loadPlaylists}
                  className="text-xs font-semibold text-purple-300 transition hover:text-purple-200"
                >
                  Refresh
                </button>
              </div>

              {playlistLoading ? (
                <PlaylistSkeleton />
              ) : playlists.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-white/45">
                  No playlists found.
                </div>
              ) : (
                <div className="max-h-[330px] space-y-3 overflow-y-auto pr-1">
                  {playlists.map((playlist) => {
                    const isSelected = selectedPlaylist?.id === playlist.id;
                    const isSelecting = selectingId === playlist.id;
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => selectPlaylist(playlist.id)}
                        className="ambient-row flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
                        style={{
                          borderColor: isSelected ? accent : "rgba(255,255,255,0.08)",
                          background: isSelected ? "rgba(168,85,247,0.13)" : "rgba(255,255,255,0.03)",
                          boxShadow: isSelected ? `0 0 24px -10px ${glow}` : "none",
                        }}
                      >
                        {playlist.image ? (
                          <img
                            src={playlist.image}
                            alt=""
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                            <Music2 size={18} className="text-white/45" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{playlist.name}</p>
                          <p className="mt-1 truncate text-xs text-white/45">
                            {playlist.trackCount} tracks - {playlist.owner}
                          </p>
                        </div>
                        {isSelecting ? (
                          <Loader2 size={16} className="animate-spin text-purple-300" />
                        ) : isSelected ? (
                          <CheckCircle2 size={17} color={accent} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {embedUrl && (
              <div>
                <div className="mb-3">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                    {selectedPlaylistName}
                  </p>
                </div>
                <div
                  onMouseDown={() => {
                    setActiveSource("spotify");
                    stopAmbient();
                  }}
                  className="overflow-hidden rounded-2xl border border-purple-400/20 bg-black/30 shadow-xl shadow-purple-950/20"
                >
                  <iframe
                    key={`${selectedPlaylist.id}-${spotifyPlayerKey}`}
                    title="Spotify playlist player"
                    src={embedUrl}
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="block"
                    style={{ border: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
