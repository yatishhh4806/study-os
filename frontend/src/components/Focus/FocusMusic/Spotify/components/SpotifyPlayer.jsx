import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Music2,
} from "lucide-react";

function formatTime(ms) {
  if (!ms || Number.isNaN(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function SpotifyPlayer({ player, playback }) {
  const { ready, track, paused, position, duration } = player;

  const [displayPosition, setDisplayPosition] = useState(position);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [volume, setVolumeState] = useState(50);
  const [showVolume, setShowVolume] = useState(false);
  const [localPaused, setLocalPaused] = useState(null);

  const anchorRef = useRef({ position, timestamp: Date.now() });

  // Sync optimistic state back to real state once SDK events fire
  useEffect(() => {
    setLocalPaused(null);
  }, [paused]);

  const isPaused = localPaused !== null ? localPaused : paused;

  useEffect(() => {
    anchorRef.current = { position, timestamp: Date.now() };
    if (!seeking) setDisplayPosition(position);
  }, [position, seeking]);

  useEffect(() => {
    if (isPaused || seeking) return;

    let raf;
    const tick = () => {
      const elapsed = Date.now() - anchorRef.current.timestamp;
      const next = Math.min(
        anchorRef.current.position + elapsed,
        duration || 0,
      );
      setDisplayPosition(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, seeking, duration]);

  const progressPct = duration
    ? ((seeking ? seekValue : displayPosition) / duration) * 100
    : 0;

  function handleSeekStart(e) {
    setSeeking(true);
    setSeekValue(Number(e.target.value));
  }

  // Optimistic seek updates
  function handleSeekChange(e) {
    const val = Number(e.target.value);
    setSeekValue(val);
    anchorRef.current = { position: val, timestamp: Date.now() };
    setDisplayPosition(val);
  }

  async function handleSeekCommit(e) {
    const value = Number(e.target.value);
    await playback.seek(value);
    anchorRef.current = { position: value, timestamp: Date.now() };
    setDisplayPosition(value);
    setSeeking(false);
  }

  async function handleVolumeChange(e) {
    const value = Number(e.target.value);
    setVolumeState(value);
    await playback.setVolume(value);
  }

  function handleTogglePlay() {
    if (isPaused) {
      setLocalPaused(false);
      playback.resume();
    } else {
      setLocalPaused(true);
      playback.pause();
    }
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
      <div
        className={`pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-[70px] transition-opacity duration-1000 ${
          !isPaused && track ? "opacity-40 animate-pulse" : "opacity-15"
        }`}
      />

      {track ? (
        <div className="relative">
          <div className="relative mx-auto h-56 w-56">
            <div
              className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/60 to-fuchsia-500/60 blur-2xl transition-opacity duration-700 ${
                !isPaused ? "opacity-70" : "opacity-0"
              }`}
            />
            <img
              src={track.image}
              alt={track.name}
              className="relative h-full w-full rounded-2xl object-cover shadow-2xl shadow-black/40 ring-1 ring-white/10"
            />

            {!isPaused && (
              <div className="absolute bottom-3 right-3 flex h-7 items-end gap-[3px] rounded-full bg-black/50 px-2 py-1.5 backdrop-blur-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-[2.5px] rounded-full bg-white"
                    style={{
                      height: "60%",
                      animation: `eq-bar 0.9s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <h2 className="truncate text-lg font-semibold text-white">
              {track.name}
            </h2>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <p className="truncate text-sm text-white/50">{track.artist}</p>
              <span className="text-white/20">·</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    !isPaused ? "bg-violet-400" : "bg-white/30"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    !isPaused ? "text-violet-300" : "text-white/40"
                  }`}
                >
                  {!isPaused ? "Playing" : "Paused"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative h-1.5 w-full rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-100"
                style={{ width: `${progressPct}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={seeking ? seekValue : displayPosition}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="absolute inset-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/40"
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-white/40">
              <span>{formatTime(seeking ? seekValue : displayPosition)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={playback.previous}
              className="text-white/60 transition hover:scale-110 hover:text-white"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/40 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isPaused ? (
                <Play size={22} fill="currentColor" className="ml-0.5" />
              ) : (
                <Pause size={22} fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={playback.next}
              className="text-white/60 transition hover:scale-110 hover:text-white"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          <div
            className="relative mt-5 flex items-center justify-center gap-3"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <VolumeIcon size={16} className="text-white/40" />
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showVolume ? "w-24 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={handleVolumeChange}
                className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-400"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Music2 size={24} className="text-white/30" />
          </div>
          <p className="mt-4 text-sm text-white/40">
            {ready ? "Play a playlist to see track" : "Connecting to Spotify..."}
          </p>
        </div>
      )}

      <style>{`
        @keyframes eq-bar {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}