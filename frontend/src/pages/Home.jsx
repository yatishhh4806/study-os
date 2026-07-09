import LiquidEther from "../components/HomePageBG/LiquidEther";
import Navbar from "../components/Layout/Navbar";
import MagicBento from "../components/MagicBento/MagicBento";
import { useNavigate } from "react-router-dom";
import Preview from "../components/Preview/Preview";
import About from "../components/About/About";
import Footer from "../components/Layout/Footer";
import { Section } from "lucide-react";
import HeroSection from "../components/Hero/HeroSection";
import Features from "../components/Features/Features";
import TestimonialsSection from "../components/Testimonials/UserTestimonials";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-screen bg-[#080510]">
      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 z-9999 w-[92%] -translate-x-1/2">
        <Navbar />
      </nav>

      {/* HERO */}
      <HeroSection />

      {/* FEATURES */}
      <section
        id="features"
        className="relative z-20 bg-[#09070f] px-4 py-12 sm:px-8 sm:py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
            Features
          </h1>

          <div className="mt-10 sm:mt-16 md:mt-20">
            <div className="relative z-20 bg-[#09070f]">
              <Features />
            </div>
          </div>
        </div>
      </section>

      {/* PREVIEW */}
      <section
        id="preview"
        className="relative z-20 bg-[#09070f] px-4 py-12 sm:px-8 sm:py-16"
      >
        <Preview />
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="relative overflow-hidden bg-linear-to-b from-[#09070f] via-[#120B1D] to-[#09070f] px-4 py-16 sm:px-8 sm:py-24 md:py-40"
      >
        {/* Glow */}
        <div className="absolute left-1/2 top-20 h-125 w-125 -translate-x-1/2 rounded-full bg-purple-500/10 blur-[180px]" />

        <div className="relative z-20">
          <About />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-linear-to-b from-[#0E0A17] to-[#09070f]">
        {/* Glow */}
        <div className="absolute left-1/2 top-0 h-100 w-100 -translate-x-1/2 rounded-full bg-purple-500/5 blur-[180px]" />

        <div className="relative z-20">
          <Footer />
        </div>
      </footer>
    </div>
  );
}

export default Home;