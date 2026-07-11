import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";

import AuthHero from "../components/AuthHero/AuthHero";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../lib/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      setError(oauthError);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate(location.state?.from?.pathname || "/dashboard");
      } catch (err) {
        setError(err.response?.data?.error || "Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled or failed. Please try again."),
  });

  function handleGithubLogin() {
    window.location.href = `${BASE_URL}/auth/github`;
  }

  async function handleManualLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09070f] lg:flex-row">
      {/* LEFT */}
      <div
        className="
          relative
          hidden
          overflow-hidden
          bg-linear-to-br
          from-purple-500
          via-[#261238]
          to-[#02030a]
          lg:flex
          lg:w-[40%]
          lg:flex-col
          lg:justify-between
          lg:p-10
          xl:p-16
        "
      >
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px] sm:h-96 sm:w-96 lg:h-125 lg:w-125 lg:blur-[160px]" />

        <div className="relative z-10">
          <AuthHero />
        </div>

        <div className="relative z-10 mb-10 xl:mb-20">
          <h1 className="text-4xl font-black leading-tight text-purple-300 xl:text-7xl">
            WELCOME
            <br />
            BACK
          </h1>

          <p className="mt-4 max-w-md text-base leading-7 text-gray-300 xl:text-lg xl:leading-8">
            Continue your journey toward academic excellence with StudyOS.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
        <div className="absolute h-64 w-64 rounded-full bg-purple-500/5 blur-[100px] sm:h-96 sm:w-96 lg:h-100 lg:w-100 lg:blur-[140px]" />

        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-center text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Study
            <span className="text-purple-400">OS</span>
          </h1>

          <h2 className="mt-6 text-center text-2xl font-bold text-white sm:mt-8 sm:text-3xl md:mt-10 md:text-4xl">
            Welcome Back
          </h2>

          <p className="mt-3 text-center text-sm text-gray-400 sm:text-base">
            New to StudyOS?
            <Link
              to="/signup"
              className="ml-2 font-semibold text-purple-400 hover:text-purple-300"
            >
              Sign up
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleManualLogin}>
            <div className="mt-6 sm:mt-8">
              <label className="text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none transition focus:border-purple-500 sm:p-4"
              />
            </div>

            <div className="mt-5 sm:mt-6">
              <label className="text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none transition focus:border-purple-500 sm:p-4"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-purple-500 py-3 font-bold text-white transition hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-8 sm:py-4"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 sm:my-8">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-sm text-gray-500">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex gap-3 sm:gap-4">
            <button
              onClick={() => googleLogin()}
              disabled={googleLoading}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 py-3 text-sm text-white transition hover:border-purple-500/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed sm:gap-3 sm:py-4 sm:text-base"
            >
              <FcGoogle size={20} className="sm:hidden" />
              <FcGoogle size={24} className="hidden sm:block" />
              {googleLoading ? "Signing in..." : "Google"}
            </button>

            <button
              onClick={handleGithubLogin}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 py-3 text-sm text-white transition hover:border-purple-500/40 hover:bg-white/5 sm:gap-3 sm:py-4 sm:text-base"
            >
              <FaGithub size={18} className="sm:hidden" />
              <FaGithub size={22} className="hidden sm:block" />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;