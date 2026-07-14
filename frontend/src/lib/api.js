// src/lib/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("BASE_URL =", BASE_URL);
export { BASE_URL };

// The access token lives in memory only (never localStorage) — it's short-
// lived (15 min) by design, and keeping it out of localStorage avoids
// exposing it to XSS. The refresh token is a separate httpOnly cookie the
// browser sends automatically; JS never touches it directly.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000, // fail fast rather than hanging indefinitely on a stalled request (e.g. cold start, flaky network)
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── silent refresh-on-expiry ──────────────────────────────────────────
// If multiple requests fail with an expired token at once (e.g. a page
// firing several API calls on load), only one refresh call should go out;
// the rest wait for it and retry once it resolves.
let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isExpired = error.response?.data?.code === "TOKEN_EXPIRED";
    const isAuthRoute = originalRequest.url?.includes("/auth/");

    if (isExpired && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // a refresh is already in flight — wait for it instead of firing
        // a second one
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // let AuthContext's listener (see below) know the session is dead
        window.dispatchEvent(new Event("studyos:session-expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);