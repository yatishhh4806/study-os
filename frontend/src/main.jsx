import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

// Only send errors to Sentry in production — local dev errors are noisy
// and not useful to have cluttering the dashboard.
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09070f] p-8 text-center">
      <h1 className="text-2xl font-bold text-white">Something went wrong.</h1>
      <p className="mt-2 max-w-md text-gray-400">
        We've been notified and are looking into it. Try refreshing the page —
        if the problem continues, please let us know what you were doing when
        this happened.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-600"
      >
        Refresh Page
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog={false}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);