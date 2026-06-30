import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import AuthHero from "../components/AuthHero/AuthHero";

function Signup() {
  return (
    <div className="flex min-h-screen bg-[#09070f]">
      {/* LEFT SIDE */}
      <div
        className="
          relative
          hidden
          w-[40%]
          overflow-hidden
          bg-linear-to-br
          from-purple-500
          via-[#261238]
          to-[#02030a]
          lg:flex
          lg:flex-col
          lg:justify-between
          lg:p-16
        "
      >
        <AuthHero></AuthHero>
        {/* Bottom Content */}
        <div className="relative z-10 mb-25">
          <h1 className="text-7xl font-black text-purple-300">
            START
            <br />
            LEARNING
          </h1>

          <p className="mt-2 max-w-md text-lg text-gray-400">
            Join thousands of students using StudyOS to organize their
            academics and boost productivity.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center px-10 py-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <h2 className="text-center text-5xl font-black text-white">
            StudyOS
          </h2>

          {/* Heading */}
          <h3 className="mt-10 text-center text-4xl font-bold text-white">
            Create Account
          </h3>

          <p className="mt-3 text-center text-gray-400">
            Already have an account?
            <Link
              to="/login"
              className="ml-2 font-medium text-purple-400 hover:text-purple-300"
            >
              Sign In
            </Link>
          </p>

          {/* Name */}
          <div className="mt-12">
            <label className="text-gray-400">
              Full Name
            </label>

            <input
              type="text"
              placeholder="John Doe"
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

          {/* Email */}
          <div className="mt-6">
            <label className="text-gray-400">
              Email
            </label>

            <input
              type="email"
              placeholder="john@gmail.com"
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
              placeholder="••••••••"
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

          {/* Confirm Password */}
          <div className="mt-6">
            <label className="text-gray-400">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
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

          {/* Button */}
          <button
            className="
              mt-10
              w-full
              rounded-xl
              bg-purple-500
              py-4
              font-bold
              text-white
              shadow-lg
              shadow-purple-500/30
              transition
              hover:scale-[1.02]
              hover:bg-purple-600
            "
          >
            Create Account
          </button>

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

export default Signup;