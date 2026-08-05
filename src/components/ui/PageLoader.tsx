'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Sparkles } from 'lucide-react';

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app we might wait for window.onload or some assets to load.
    // For this demonstration, we'll show it for a fixed duration to feel like a premium entrance.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#141210] overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E5A93C]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <Coffee className="w-8 h-8" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
              </motion.div>
            </div>
            
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading font-extrabold text-2xl uppercase tracking-[0.2em] text-white drop-shadow-md"
              >
                Cafein Today
              </motion.h1>
            </div>
          </motion.div>

          {/* Loading Progress Line */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/10 overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="h-full bg-[#E5A93C]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
