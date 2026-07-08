import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      // Always show the same success state, whether or not the email
      // actually exists — matches the backend's anti-enumeration design,
      // so this page can't be used to check which emails are registered.
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#09070f] px-6">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl font-black text-white">
          Study<span className="text-purple-400">OS</span>
        </h1>

        <h2 className="mt-10 text-center text-3xl font-bold text-white">
          Reset your password
        </h2>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-4 text-center">
            <p className="text-sm text-white/80">
              If an account exists for <span className="font-semibold text-white">{email}</span>,
              we've sent a link to reset your password. Check your inbox (and spam folder).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="mt-3 text-center text-gray-400">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-8">
              <label className="text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-purple-500 py-4 font-bold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-gray-400">
          <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300">
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}