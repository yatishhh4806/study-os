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
    // Auth pages are intentionally compact and NOT width-scaled — a login
    // form doesn't need to get bigger on a wider screen, it just needs to
    // fit the viewport height. Many common laptop resolutions (1366x768,
    // 1536x864) are wide but short, so scaling sizes up with width alone
    // caused content to overflow vertically on exactly those screens.
    <div className="flex min-h-screen flex-col bg-[#09070f] lg:flex-row">
      {/* LEFT — visual panel, shown only when there's enough width for it */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-purple-500 via-[#261238] to-[#02030a] lg:flex lg:w-[38%] lg:flex-col lg:justify-between lg:p-8 xl:w-[40%]">
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[110px] [@media(min-height:850px)]:h-72 [@media(min-height:850px)]:w-72 [@media(min-height:1000px)]:h-96 [@media(min-height:1000px)]:w-96 [@media(min-height:1000px)]:blur-[150px]" />

        <div className="relative z-10">
          <AuthHero />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black leading-tight text-purple-300 [@media(min-height:850px)]:text-4xl [@media(min-height:1000px)]:text-6xl">
            WELCOME
            <br />
            BACK
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-gray-300 [@media(min-height:850px)]:text-base [@media(min-height:850px)]:leading-7">
            Continue your journey toward academic excellence with StudyOS.
          </p>
        </div>
      </div>

      {/* RIGHT — the actual form, sized to comfortably fit a short viewport
          first; only gets roomier when there's vertical space to spare */}
      <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-8">
        <div className="absolute h-56 w-56 rounded-full bg-purple-500/5 blur-[90px] [@media(min-height:850px)]:h-72 [@media(min-height:850px)]:w-72 [@media(min-height:1000px)]:h-96 [@media(min-height:1000px)]:w-96" />

        <div className="relative z-10 w-full max-w-md py-2">
          <h1 className="text-center text-2xl font-black text-white [@media(min-height:850px)]:text-3xl [@media(min-height:1000px)]:text-4xl">
            Study
            <span className="text-purple-400">OS</span>
          </h1>

          <h2 className="mt-4 text-center text-xl font-bold text-white [@media(min-height:850px)]:mt-6 [@media(min-height:850px)]:text-2xl [@media(min-height:1000px)]:text-3xl">
            Welcome Back
          </h2>

          <p className="mt-2 text-center text-sm text-gray-400">
            New to StudyOS?
            <Link to="/signup" className="ml-2 font-semibold text-purple-400 hover:text-purple-300">
              Sign up
            </Link>
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleManualLogin}>
            <div className="mt-4">
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none transition focus:border-purple-500"
              />
            </div>

            <div className="mt-3">
              <label className="text-sm text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none transition focus:border-purple-500"
              />
            </div>

            <div className="mt-2 flex justify-end">
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-purple-500 py-2.5 font-bold text-white transition hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => googleLogin()}
              disabled={googleLoading}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 py-2.5 text-sm text-white transition hover:border-purple-500/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle size={20} />
              {googleLoading ? "Signing in..." : "Google"}
            </button>

            <button
              onClick={handleGithubLogin}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 py-2.5 text-sm text-white transition hover:border-purple-500/40 hover:bg-white/5"
            >
              <FaGithub size={18} />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;