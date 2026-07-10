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

  // If GitHub's callback failed, our backend redirects here with
  // ?error=... so the person sees why instead of landing on a blank
  // login page with no explanation.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      setError(oauthError);
      navigate(location.pathname, { replace: true }); // strip the query param from the URL
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

  // GitHub uses a full-page redirect flow (not a popup like Google) —
  // the browser navigates away to GitHub, then back to our backend
  // callback, which sets the session cookie and redirects here again.
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
    <div className="flex h-screen overflow-hidden bg-[#09070f]">
      {/* LEFT */}
      <div
        className="
          relative
          hidden
          w-[40%]
          overflow-hidden
          bg-gradient-to-br
          from-purple-500
          via-[#261238]
          to-[#02030a]
          lg:flex
          lg:flex-col
          lg:justify-between
          lg:p-16
        "
      >
        {/* Glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[160px]" />

        <div className="relative z-10">
          <AuthHero />
        </div>

        <div className="relative z-10 mb-20">
          <h1 className="text-7xl font-black text-purple-300">
            WELCOME
            <br />
            BACK
          </h1>

          <p className="mt-4 max-w-md text-lg leading-8 text-gray-300">
            Continue your journey toward academic excellence with StudyOS.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex flex-1 items-center justify-center px-10">
        {/* Glow */}
        <div className="absolute h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[140px]" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <h1 className="text-center text-5xl font-black text-white">
            Study
            <span className="text-purple-400">OS</span>
          </h1>

          {/* Heading */}
          <h2 className="mt-10 text-center text-4xl font-bold text-white">
            Welcome Back
          </h2>

          <p className="mt-3 text-center text-gray-400">
            New to StudyOS?
            <Link
              to="/signup"
              className="ml-2 font-semibold text-purple-400 hover:text-purple-300"
            >
              Sign up
            </Link>
          </p>

          {/* Error message */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleManualLogin}>
            {/* Email */}
            <div className="mt-8">
              <label className="text-gray-400">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="
                  mt-3
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/30
                  p-4
                  text-white
                  outline-none
                  transition
                  focus:border-purple-500
                "
              />
            </div>

            {/* Password */}
            <div className="mt-6">
              <label className="text-gray-400">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="
                  mt-3
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/30
                  p-4
                  text-white
                  outline-none
                  transition
                  focus:border-purple-500
                "
              />
            </div>

            {/* Forgot */}
            <div className="mt-4 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-8
                w-full
                rounded-xl
                bg-purple-500
                py-4
                font-bold
                text-white
                transition
                hover:bg-purple-600
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-sm text-gray-500">
              or continue with
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4">
            {/* Google — now live */}
            <button
              onClick={() => googleLogin()}
              disabled={googleLoading}
              type="button"
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-black/20
                py-4
                text-white
                transition
                hover:border-purple-500/40
                hover:bg-white/5
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <FcGoogle size={24} />
              {googleLoading ? "Signing in..." : "Google"}
            </button>

            {/* GitHub — now live */}
            <button
              onClick={handleGithubLogin}
              type="button"
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-black/20
                py-4
                text-white
                transition
                hover:border-purple-500/40
                hover:bg-white/5
              "
            >
              <FaGithub size={22} />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;