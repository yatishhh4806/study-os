import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";

import AuthHero from "../components/AuthHero/AuthHero";

import {
  auth,
  googleProvider,
  githubProvider,
} from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleManualLogin = (e) => {
    e.preventDefault();

    // Temporary
    navigate("/dashboard");
  };

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

          {/* FORM */}
          <form onSubmit={handleManualLogin}>
            {/* Email */}
            <div className="mt-12">
              <label className="text-gray-400">
                Email
              </label>

              <input
                type="email"
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
              "
            >
              Sign In
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
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
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
              <FcGoogle size={24} />
              Google
            </button>

            {/* GitHub */}
            <button
              onClick={handleGithubLogin}
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