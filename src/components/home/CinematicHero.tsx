'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

export function CinematicHero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Smooth parallax that only applies while scrolling past this 100vh section
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);

  // Text Reveal Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const titleText = "Cafein Today".split("");

  return (
    <section 
      ref={containerRef}
      className="relative h-[100svh] w-full font-sans select-none bg-[#141210] overflow-hidden flex items-center justify-center"
    >
      {/* Cinematic Video Background */}
      <motion.div
        className="absolute inset-0 z-0 gpu-accelerated overflow-hidden bg-[#141210]"
        style={{ scale: bgScale }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-70"
        >
          {/* Local video from media directory */}
          <source src="/media/landingpage.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Cinematic Ambient Lighting & Vignette */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#141210]/60 via-[#141210]/30 to-[#141210] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-[#E5A93C]/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

      {/* Evolving Hero Title & Content */}
      <motion.div 
        style={{ y: titleY, opacity: titleOpacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center gpu-accelerated"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#F0BA53] micro-label mb-8 shadow-[0_0_25px_rgba(229,169,60,0.25)] backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-[#E5A93C]" />
          <span>An Artisanal Sanctuary in the City</span>
        </motion.div>

        <h1 className="hero-title flex overflow-hidden text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-[#FFFFFF] mb-6 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] tracking-tight text-balance font-bold">
          {titleText.map((char, index) => (
            <motion.span
              key={index}
              variants={itemVariants}
              className={char === " " ? "ml-2 sm:ml-4 md:ml-8" : ""}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={itemVariants}
          className="supporting-paragraph text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-[#ECE6DD] font-normal tracking-wide text-balance drop-shadow-md"
        >
          An architectural sanctuary designed for connection, private contemplation, and artisanal coffee rituals.
        </motion.p>
      </motion.div>

      {/* Scroll Indicator with Magnetic / Hover effect */}
      <motion.a
        href="#brand-story"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        whileHover={{ scale: 1.1, y: 5 }}
        style={{ opacity: titleOpacity }}
        className="absolute bottom-16 z-20 flex flex-col items-center text-[#C6C0B4] cursor-pointer drop-shadow-md group"
      >
        <span className="micro-label text-[10px] text-[#F0BA53] mb-2 font-bold group-hover:text-[#E5A93C] transition-colors">Begin Journey</span>
        <ChevronDown className="h-5 w-5 text-[#F0BA53] stroke-[2.5] animate-bounce group-hover:animate-none" />
      </motion.a>
    </section>
  );
}
