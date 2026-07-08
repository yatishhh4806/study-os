import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09070f] px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-black text-white">
            Study<span className="text-purple-400">OS</span>
          </h1>
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="text-sm text-red-300">
              This link is missing a reset token. Please request a new password reset link.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="mt-6 inline-block font-semibold text-purple-400 hover:text-purple-300"
          >
            Request a new link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#09070f] px-6">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl font-black text-white">
          Study<span className="text-purple-400">OS</span>
        </h1>
        <h2 className="mt-10 text-center text-3xl font-bold text-white">Set a new password</h2>

        {done ? (
          <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center">
            <p className="text-sm text-emerald-300">
              Password updated! Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-8">
              <label className="text-gray-400">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            <div className="mt-6">
              <label className="text-gray-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-purple-500 py-4 font-bold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}