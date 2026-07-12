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
    // Fluid clamp()-based sizing handles the short-to-medium range
    // smoothly. On top of that, an explicit [@media(min-height:1000px)]
    // override restores the full, spacious original design for genuinely
    // tall/common screens (1080p and up), since clamp's vh-based scaling
    // alone was too conservative to look "full size" even at 1920x1080.
    <div className="flex min-h-screen flex-col bg-[#09070f] lg:flex-row">
      {/* LEFT */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-purple-500 via-[#261238] to-[#02030a] lg:flex lg:w-[38%] lg:flex-col lg:justify-between xl:w-[40%] p-[clamp(1.5rem,4vh,4rem)] [@media(min-height:1000px)]:lg:p-16">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 w-[clamp(14rem,32vh,31.25rem)] h-[clamp(14rem,32vh,31.25rem)] filter-[blur(clamp(6rem,10vh,10rem))] [@media(min-height:1000px)]:h-125 [@media(min-height:1000px)]:w-125 [@media(min-height:1000px)]:blur-[160px]" />

        <div className="relative z-10">
          <AuthHero />
        </div>

        <div className="relative z-10">
          <h1 className="font-black leading-[0.95] text-purple-300 text-[clamp(1.75rem,6vh,4.5rem)] [@media(min-height:1000px)]:text-7xl">
            WELCOME
            <br />
            BACK
          </h1>

          <p className="max-w-md leading-7 text-gray-300 text-[clamp(0.875rem,2vh,1.125rem)] mt-[clamp(0.75rem,2vh,1rem)] [@media(min-height:1000px)]:mt-4 [@media(min-height:1000px)]:text-lg">
            Continue your journey toward academic excellence with StudyOS.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-4 sm:px-8 pt-[clamp(1.5rem,4vh,4rem)] pb-[clamp(1.5rem,4vh,4rem)]-height:1000px)]:py-16">
        <div className="absolute rounded-full bg-purple-500/5 w-[clamp(14rem,28vh,25rem)] h-[clamp(14rem,28vh,25rem)] filter-[blur(clamp(5rem,8vh,8.75rem))] [@media(min-height:1000px)]:h-100 [@media(min-height:1000px)]:w-100 [@media(min-height:1000px)]:blur-[140px]" />

        <div className="relative z-10 w-full max-w-[clamp(22rem,32vw,28rem)]">
          <h1 className="text-center font-black text-white text-[clamp(1.5rem,4.5vh,3rem)] [@media(min-height:1000px)]:text-5xl">
            Study
            <span className="text-purple-400">OS</span>
          </h1>

          <h2 className="text-center font-bold text-white text-[clamp(1.25rem,3.5vh,2.5rem)] mt-[clamp(0.75rem,2vh,1.5rem)] [@media(min-height:1000px)]:mt-10 [@media(min-height:1000px)]:text-4xl">
            Welcome Back
          </h2>

          <p className="mt-2 text-center text-gray-400 text-[clamp(0.8125rem,1.6vh,1rem)] [@media(min-height:1000px)]:text-base">
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
            <div className="mt-[clamp(1rem,2.5vh,1.5rem)] [@media(min-height:1000px)]:mt-8">
              <label className="text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 text-white outline-none transition focus:border-purple-500 [font-size:clamp(0.8125rem,1.6vh,1rem)] [padding:clamp(0.625rem,1.8vh,1rem)] [@media(min-height:1000px)]:p-4 [@media(min-height:1000px)]:text-base"
              />
            </div>

            <div className="[margin-top:clamp(0.75rem,2vh,1.25rem)] [@media(min-height:1000px)]:mt-6">
              <label className="text-sm text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 text-white outline-none transition focus:border-purple-500 [font-size:clamp(0.8125rem,1.6vh,1rem)] [padding:clamp(0.625rem,1.8vh,1rem)] [@media(min-height:1000px)]:p-4 [@media(min-height:1000px)]:text-base"
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
              className="w-full rounded-xl bg-purple-500 font-bold text-white transition hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed [font-size:clamp(0.875rem,1.8vh,1rem)] [margin-top:clamp(1rem,2.5vh,1.5rem)] [padding-top:clamp(0.625rem,1.8vh,1rem)] [padding-bottom:clamp(0.625rem,1.8vh,1rem)] [@media(min-height:1000px)]:mt-8 [@media(min-height:1000px)]:py-4 [@media(min-height:1000px)]:text-base"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-4 [margin-top:clamp(1rem,2.5vh,2rem)] [margin-bottom:clamp(1rem,2.5vh,2rem)] [@media(min-height:1000px)]:my-8">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500 [@media(min-height:1000px)]:text-sm">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex gap-3 [@media(min-height:1000px)]:gap-4">
            <button
              onClick={() => googleLogin()}
              disabled={googleLoading}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 text-white transition hover:border-purple-500/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed [font-size:clamp(0.8125rem,1.6vh,1rem)] [padding-top:clamp(0.625rem,1.8vh,1rem)] [padding-bottom:clamp(0.625rem,1.8vh,1rem)] [@media(min-height:1000px)]:py-4 [@media(min-height:1000px)]:text-base"
            >
              <FcGoogle size={20} />
              {googleLoading ? "Signing in..." : "Google"}
            </button>

            <button
              onClick={handleGithubLogin}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 text-white transition hover:border-purple-500/40 hover:bg-white/5 [font-size:clamp(0.8125rem,1.6vh,1rem)] [padding-top:clamp(0.625rem,1.8vh,1rem)] [padding-bottom:clamp(0.625rem,1.8vh,1rem)] [@media(min-height:1000px)]:py-4 [@media(min-height:1000px)]:text-base"
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