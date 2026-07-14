import { useEffect, useRef, useState } from "react";

const STORAGE_KEYS = {
  sound: "studyos:ambient:sound",
  volume: "studyos:ambient:volume",
};

function safeGet(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    if (value == null || value === "") {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch {}
}

export const SOUNDS = [
  {
    key: "rain",
    label: "Rain",
    file: "/audio/rain.mp3",
  },
  {
    key: "cafe",
    label: "Cafe",
    file: "/audio/cafe.mp3",
  },
  {
    key: "forest",
    label: "Forest",
    file: "/audio/forest.mp3",
  },
  {
    key: "fireplace",
    label: "Fireplace",
    file: "/audio/fireplace.mp3",
  },
  {
    key: "lofi",
    label: "Lofi",
    file: "/audio/lofi.mp3",
  },
];

export default function useAmbient() {
  const audioRef = useRef(null);

  const [activeSound, setActiveSound] = useState(() =>
    safeGet(STORAGE_KEYS.sound)
  );

  const [volume, setVolume] = useState(() => {
    const value = Number(
      safeGet(STORAGE_KEYS.volume, "55")
    );

    return Number.isFinite(value) ? value : 55;
  });

  useEffect(() => {
    safeSet(STORAGE_KEYS.volume, volume);

    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
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

    const sound = SOUNDS.find(
      (s) => s.key === activeSound
    );

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
      console.error(err);

      setActiveSound(null);

      safeSet(STORAGE_KEYS.sound, null);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [activeSound, volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  function stopAmbient() {
    if (audioRef.current) {
      audioRef.current.pause();

      audioRef.current.currentTime = 0;
    }

    setActiveSound(null);

    safeSet(STORAGE_KEYS.sound, null);
  }

  function toggleSound(key) {
    if (activeSound === key) {
      stopAmbient();
      return;
    }

    setActiveSound(key);

    safeSet(STORAGE_KEYS.sound, key);
  }

  return {
    sounds: SOUNDS,

    activeSound,

    volume,

    setVolume,

    toggleSound,

    stopAmbient,
  };
}