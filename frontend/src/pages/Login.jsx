import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import AuthHero from "../components/AuthHero/AuthHero";

function Login() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#09070f]">
      {/* LEFT */}
      <div className="relative hidden w-[40%] overflow-hidden bg-linear-to-br from-purple-500 via-[#261238] to-[#02030a] lg:flex lg:flex-col lg:justify-between lg:p-16">
        <AuthHero></AuthHero>
        <div className="relative z-10 mb-25">
          <h1 className="text-7xl font-black text-purple-300">
            WELCOME
            <br />
            BACK
          </h1>

          <p className="mt-2 max-w-md text-lg text-gray-400 z-0">
            Continue your journey toward academic excellence <br></br>with StudyOS.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-1 items-center justify-center px-10">
        <div className="w-full max-w-md">
          <h2 className="text-center text-5xl font-black text-white">
            StudyOS
          </h2>

          <h3 className="mt-10 text-center text-4xl font-bold text-white">
            Welcome Back
          </h3>

          <p className="mt-3 text-center text-gray-400">
            New to StudyOS?
            <Link to="/signup" className="ml-2 text-purple-400">
              Sign up
            </Link>
          </p>

          <div className="mt-12">
            <label className="text-gray-400">Email</label>
            <input
              type="email"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="mt-6">
            <label className="text-gray-400">Password</label>
            <input
              type="password"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-purple-500"
            />
          </div>

          <button className="mt-10 w-full rounded-xl bg-purple-500 py-4 font-bold text-white transition hover:bg-purple-600">
            Sign In
          </button>

          {/* Social Buttons (Removed Redundant Wrapper) */}
          <div className="mt-8 flex w-full gap-4">
            {/* Google */}
            <button className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 py-4 text-white transition hover:border-purple-500/40 hover:bg-white/5">
              <FcGoogle size={24} />
              Google
            </button>

            {/* Github */}
            <button className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 py-4 text-white transition hover:border-purple-500/40 hover:bg-white/5">
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