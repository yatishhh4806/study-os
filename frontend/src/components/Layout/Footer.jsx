import React from "react";
import {
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";
import { Link } from 'react-router-dom'
import { SiGmail } from "react-icons/si";

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-purple-500/10 bg-[#09070f]">
      {/* Glow */}
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/5 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-8 py-20">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          
          {/* Brand */}
          <div>
            <h2 className="text-4xl font-black text-white">
              Study<span className="text-purple-400">OS</span>
            </h2>

            <p className="mt-6 leading-7 text-gray-400">
              The operating system for academic excellence.
              Notes, planning, focus, AI and productivity —
              unified into one beautiful ecosystem.
            </p>
          </div>

          {/* Contact */}
          <div className="gap-5">
            <h3 className="mb-5 text-xl font-bold text-white">
              Contact & Connect
            </h3>

            <div className="space-y-4">
              <Link to="mailto:sagy48@gmail.com" className="flex text-2xl mt-5 transition hover:text-purple-400">
                <SiGmail className="self-center"/>
                <div className="ml-2">Gmail</div>
              </Link>

              <Link to="https://www.instagram.com" className="flex text-2xl mt-5 transition hover:text-purple-400">
                <FaInstagram className="self-center" />
                <div className="ml-2">Instagram</div>
              </Link>

              <Link to="https://www.x.com" className="flex text-2xl mt-5 transition hover:text-purple-400">
                <RiTwitterXLine className="self-center"/>
                <div className="ml-2">Twitter</div>
              </Link>

             <p className="pt-2 text-sm text-gray-500">
                Usually replies within 24 hours.
              </p>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-5 text-xl font-bold text-white">
              Explore
            </h3>

            <div className="space-y-3">
              <p className="text-gray-400 transition hover:text-purple-400">
                📝 Smart Notes
              </p>

              <p className="text-gray-400 transition hover:text-purple-400">
                🤖 AI Assistant
              </p>

              <p className="text-gray-400 transition hover:text-purple-400">
                📅 Planner
              </p>

              <p className="text-gray-400 transition hover:text-purple-400">
                📊 Analytics
              </p>

              <p className="text-gray-400 transition hover:text-purple-400">
                🎯 Focus Sessions
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <h3 className="mb-5 text-xl font-bold text-white">
              Feedback
            </h3>

            <p className="mb-4 text-gray-400">
              Help us improve StudyOS.
            </p>

            <textarea
              placeholder="Share your feedback..."
              className="
                h-28
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

            <button
              className="
                mt-4
                rounded-xl
                bg-purple-500
                px-6
                py-3
                font-semibold
                text-white
                transition
                hover:bg-purple-600
                hover:scale-[1.02]
              "
            >
              Send Feedback
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-white/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © 2026 StudyOS. All rights reserved.
            </p>

            <p className="text-sm text-purple-400">
              Built with ❤️ by Yatish
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;