"use client";

import { Quote, Star } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const defaultTestimonials = [
  {
    id: 1,
    name: "Aryan Sharma",
    role: "Computer Science Student",
    company: "IIT Delhi",
    content:
      "StudyOS replaced five different apps for me. Everything I need is now in one place.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Priya Verma",
    role: "Medical Student",
    company: "AIIMS",
    content:
      "The AI assistant and planner completely changed how I prepare for exams.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 3,
    name: "Rohan Gupta",
    role: "Engineering Student",
    company: "BITS Pilani",
    content:
      "The dashboard analytics helped me improve my study consistency dramatically.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=7",
  },
];

export default function UserTestimonials({
  title = "Loved by Students",
  subtitle = "See how students are using StudyOS to organize their academic life and improve productivity.",
  badgeText = "Trusted by students worldwide",
  testimonials = defaultTestimonials,
  autoRotateInterval = 5000,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.2,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [testimonials.length, autoRotateInterval]);

  if (!testimonials.length) return null;

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className={`relative overflow-hidden bg-[#09070f] py-8 ${className}`}
    >
      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid items-center gap-20 lg:grid-cols-2"
        >
          {/* LEFT */}
          <motion.div variants={itemVariants}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              <Star className="h-4 w-4 fill-purple-300" />
              {badgeText}
            </div>

            <h1 className="text-6xl font-black leading-tight text-white">
              {title}
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-gray-400">
              {subtitle}
            </p>

            {/* Indicators */}
            <div className="mt-12 flex gap-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? "w-12 bg-purple-500"
                      : "w-3 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            variants={itemVariants}
            className="relative h-105"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{
                  opacity: 0,
                  x: 100,
                }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 100,
                  scale: activeIndex === index ? 1 : 0.95,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="absolute inset-0"
                style={{
                  zIndex: activeIndex === index ? 10 : 0,
                }}
              >
                <div className="flex h-full flex-col rounded-4xl border border-purple-500/20 bg-black/40 p-10 backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.15)]">
                  {/* Rating */}
                  <div className="mb-8 flex gap-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-purple-400 text-purple-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative flex-1">
                    <Quote className="absolute -left-2 -top-2 h-10 w-10 text-purple-500/20" />

                    <p className="relative z-10 text-2xl font-medium leading-10 text-white">
                      "{testimonial.content}"
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="my-8 h-px bg-white/10" />

                  {/* User */}
                  <div className="flex items-center gap-5">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-16 w-16 rounded-full border border-purple-500/30 object-cover"
                    />

                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {testimonial.name}
                      </h3>

                      <p className="text-gray-400">
                        {testimonial.role}
                      </p>

                      <p className="text-purple-300">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Decorative */}
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl" />
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}