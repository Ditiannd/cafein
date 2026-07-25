import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function CinematicHero() {
  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image / Video Placeholder */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop")',
        }}
      />

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Hero Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm md:text-base mb-4 font-semibold"
        >
          Welcome to
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading text-white mb-6 drop-shadow-lg"
        >
          Cafein Today
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-white/90 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-12"
        >
          Experience artisanal coffee in a space designed for connection, creativity, and comfort.
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-32 md:bottom-12 z-20 flex flex-col items-center text-white/70 animate-bounce"
      >
        <span className="text-xs uppercase tracking-widest mb-2 font-medium">Scroll to Explore</span>
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </div>
  );
}
