import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .get("/auth/verify-email", { params: { token } })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#09070f] px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-black text-white">
          Study<span className="text-purple-400">OS</span>
        </h1>

        {status === "verifying" && (
          <p className="mt-8 text-white/60">Verifying your email...</p>
        )}

        {status === "success" && (
          <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
            <p className="text-sm text-emerald-300">
              Your email is verified! You're all set.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <p className="text-sm text-red-300">
              This verification link is invalid or has already been used.
            </p>
          </div>
        )}

        <Link
          to="/dashboard"
          className="mt-6 inline-block font-semibold text-purple-400 hover:text-purple-300"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}