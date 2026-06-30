import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const features = document.getElementById("features");
      const preview = document.getElementById("preview");
      const about = document.getElementById("about");

      const y = window.scrollY;

      setScrolled(y > 100);

      if (y < 500) {
        setActive("home");
        return;
      }

      if (about && y >= about.offsetTop - 200) {
        setActive("about");
        return;
      }

      if (preview && y >= preview.offsetTop - 200) {
        setActive("preview");
        return;
      }

      if (features && y >= features.offsetTop - 200) {
        setActive("features");
        return;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`
        mx-auto
        flex
        h-16
        items-center
        justify-between
        rounded-2xl
        border
        border-white/10
        bg-[#0c0818]/70
        px-6
        backdrop-blur-xl
        transition-all
        duration-500
        ${scrolled ? "max-w-5xl" : "max-w-7xl"}
      `}
    >
      {/* Left */}
      <button
        onClick={() => scrollTo("home")}
        className="flex items-center gap-3"
      >
        <Sparkles size={18} className="text-white" />

        <Link to="/">
          <span className="text-[28px] font-semibold text-white">StudyOS</span>
        </Link>
      </button>

      {/* Center */}
      <div className="absolute left-1/2 flex -translate-x-1/2 gap-12">
        <button
          onClick={() => scrollTo("features")}
          className={`cursor-pointer text-sm transition ${
            active === "features"
              ? "text-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Features
        </button>

        <button
          onClick={() => scrollTo("preview")}
          className={` cursor-pointer text-sm transition ${
            active === "preview"
              ? "text-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Preview
        </button>

        <button
          onClick={() => scrollTo("about")}
          className={`cursor-pointer text-sm transition ${
            active === "about"
              ? "text-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          About
        </button>
      </div>

      {/* Right */}
      <button onClick={() => navigate("/login")} className="rounded-xl bg-white px-5 py-2 font-semibold text-black transition hover:scale-105">
        Log In
      </button>
    </div>
  );
}

export default Navbar;
