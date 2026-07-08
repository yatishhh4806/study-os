import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import AuthHero from "../components/AuthHero/AuthHero";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NOTE: Google/GitHub sign-in isn't wired yet — those buttons used
  // Firebase Auth, but our backend has its own JWT-based session system
  // that doesn't know about Firebase. Logging in via Firebase alone would
  // navigate to /dashboard only to have ProtectedRoute immediately bounce
  // the person back here, since AuthContext would still show no user.
  // Fixing this properly needs a backend endpoint that verifies a
  // Firebase ID token and issues our own access/refresh tokens for it —
  // a real feature to build, not a quick patch, so it's disabled with an
  // honest message for now instead of shipping a broken loop.
  function handleSocialLogin(provider) {
    setError(`${provider} sign-in isn't connected yet — please use email and password for now.`);
  }

  async function handleManualLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // send them back to wherever ProtectedRoute intercepted them from,
      // or /dashboard by default if they came straight to /login
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
                placeholder="Enter Your Email"
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
                placeholder="Enter Your Password"
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
              <button
                type="button"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Forgot password?
              </button>
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

          {/* Social Buttons — see note above handleSocialLogin */}
          <div className="flex gap-4">
            {/* Google */}
            <button
              onClick={() => handleSocialLogin("Google")}
              title="Not connected yet"
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
                opacity-60
                transition
                hover:border-purple-500/40
                hover:bg-white/5
              "
            >
              <FcGoogle size={24} />
              Google
            </button>

            {/* GitHub */}
            <button
              onClick={() => handleSocialLogin("GitHub")}
              title="Not connected yet"
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
                opacity-60
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