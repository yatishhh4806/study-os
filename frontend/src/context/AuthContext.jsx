// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // On first load, try a silent refresh — if the httpOnly refresh cookie
  // is still valid (e.g. the person closed the tab and came back), this
  // restores their session without making them log in again.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { data } = await api.post("/auth/refresh");
        if (cancelled) return;
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        if (cancelled) return;
        setAccessToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // if api.js's response interceptor gives up on refreshing (refresh
  // token itself expired/invalid), it fires this event so we can clear
  // local state and the person gets routed back to login
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("studyos:session-expired", onExpired);
    return () => window.removeEventListener("studyos:session-expired", onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // lets a page refresh just the user object after an action that changes
  // it server-side (e.g. completing a focus session updates stats)
  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}