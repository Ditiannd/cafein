'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Coffee, Camera, Compass, ChevronUp, X } from 'lucide-react';
import Link from 'next/link';

interface FloatingDockProps {
  onOpenDrawer: () => void;
  isVisible: boolean;
}

export function FloatingDock({ onOpenDrawer, isVisible }: FloatingDockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none font-sans select-none px-4"
        >
          <motion.div
            layout
            className="pointer-events-auto bg-[#241E19]/65 backdrop-blur-2xl border border-[#E5A93C]/35 p-2 sm:p-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(229,169,60,0.25)] flex items-center gap-2 sm:gap-2.5 transition-all gpu-accelerated"
          >
            {/* Morphing Dock vs Collapsed Orb */}
            {isExpanded ? (
              <>
                {/* 1. Primary Reserve Trigger (Morphs into Apple Maps Live Planner Drawer) */}
                <button
                  onClick={onOpenDrawer}
                  className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C] text-[#141210] px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-heading font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_30px_rgba(229,169,60,0.4)] hover:scale-105 hover:shadow-[0_0_40px_rgba(229,169,60,0.6)] transition-all duration-300 group"
                >
                  <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5] group-hover:rotate-12 transition-transform text-[#141210]" />
                  <span>Reserve Table</span>
                  <span className="hidden md:inline text-[10px] bg-[#141210]/20 px-2.5 py-0.5 rounded-full font-bold tracking-normal">Live Sanctuary</span>
                </button>

                {/* 2. Menu Quick Action */}
                <Link href="/menu">
                  <button className="flex items-center gap-2 bg-[#141210]/70 border border-white/15 text-[#ECE6DD] hover:text-[#FFFFFF] hover:border-[#E5A93C]/60 px-3 sm:px-5 py-3 sm:py-3.5 rounded-full font-sans font-medium text-xs tracking-wide transition-all duration-300 hover:bg-[#141210] shadow-sm">
                    <Coffee className="w-4 h-4 text-[#E5A93C]" />
                    <span className="hidden sm:inline">Menu</span>
                  </button>
                </Link>

                {/* 3. Sanctuary Quick Action */}
                <a href="#brand-story">
                  <button className="flex items-center gap-2 bg-[#141210]/70 border border-white/15 text-[#ECE6DD] hover:text-[#FFFFFF] hover:border-[#E5A93C]/60 px-3 sm:px-5 py-3 sm:py-3.5 rounded-full font-sans font-medium text-xs tracking-wide transition-all duration-300 hover:bg-[#141210] shadow-sm">
                    <Compass className="w-4 h-4 text-[#E5A93C]" />
                    <span className="hidden md:inline">Sanctuary</span>
                  </button>
                </a>

                {/* 4. Memory Gallery Quick Action */}
                <a href="#gallery">
                  <button className="flex items-center gap-2 bg-[#141210]/70 border border-white/15 text-[#ECE6DD] hover:text-[#FFFFFF] hover:border-[#E5A93C]/60 px-3 sm:px-5 py-3 sm:py-3.5 rounded-full font-sans font-medium text-xs tracking-wide transition-all duration-300 hover:bg-[#141210] shadow-sm">
                    <Camera className="w-4 h-4 text-[#E5A93C]" />
                    <span className="hidden lg:inline">Chronicles</span>
                  </button>
                </a>

                {/* Collapse to Orb Button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  title="Collapse Centerpiece"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#141210] border border-white/15 text-[#C6C0B4] hover:text-[#FFFFFF] hover:border-white/30 flex items-center justify-center transition-all shrink-0 ml-1 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* Collapsed Glowing Reserve Orb */
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-3 bg-[#141210] border border-[#E5A93C]/70 text-[#F0BA53] px-6 py-3.5 rounded-full font-sans font-bold text-xs tracking-wide shadow-[0_0_35px_rgba(229,169,60,0.4)] hover:scale-105 hover:bg-[#E5A93C] hover:text-[#141210] transition-all duration-300 group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] group-hover:bg-[#141210] animate-ping" />
                <span>Open Sanctuary Centerpiece</span>
                <ChevronUp className="w-4 h-4 animate-bounce" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
