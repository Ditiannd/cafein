'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Coffee, Menu, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function MagneticWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      className="relative z-10"
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

interface NavbarProps {
  isStoreOpen: boolean;
  onToggleStoreState: () => void;
}

export function Navbar({ isStoreOpen, onToggleStoreState }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-700 font-sans select-none ${
        isScrolled 
          ? 'bg-[#141210]/70 backdrop-blur-md border-b border-[#E5A93C]/20 py-3.5 shadow-[0_4px_25px_rgba(0,0,0,0.35)]' 
          : 'bg-transparent border-b border-transparent py-5 sm:py-6'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between transition-all duration-700">
        {/* Brand Logo & Editorial Title */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex items-center">
              <span className="font-heading font-extrabold text-lg uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5 drop-shadow-sm">
                <span>Cafein Today</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Editorial Navigation */}
        <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-10">
          <a 
            href="#brand-story" 
            className="text-xs sm:text-[13px] font-sans font-medium text-[#ECE6DD]/90 hover:text-[#F0BA53] transition-colors duration-300 tracking-wide py-1 relative group"
          >
            <span>Philosophy</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E5A93C]/70 group-hover:w-full transition-all duration-300 ease-out" />
          </a>
          <a 
            href="#experience" 
            className="text-xs sm:text-[13px] font-sans font-medium text-[#ECE6DD]/90 hover:text-[#F0BA53] transition-colors duration-300 tracking-wide py-1 relative group"
          >
            <span>The Sanctuary</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E5A93C]/70 group-hover:w-full transition-all duration-300 ease-out" />
          </a>
          <Link 
            href="/menu" 
            className="text-xs sm:text-[13px] font-sans font-medium text-[#ECE6DD]/90 hover:text-[#F0BA53] transition-colors duration-300 tracking-wide py-1 relative group"
          >
            <span>Menu & Order</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E5A93C]/70 group-hover:w-full transition-all duration-300 ease-out" />
          </Link>
          <a 
            href="#gallery" 
            className="text-xs sm:text-[13px] font-sans font-medium text-[#ECE6DD]/90 hover:text-[#F0BA53] transition-colors duration-300 tracking-wide py-1 relative group"
          >
            <span>Journal</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E5A93C]/70 group-hover:w-full transition-all duration-300 ease-out" />
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-5">
          {/* Magnetic Reserve Table CTA */}
          <MagneticWrapper>
            <Link 
              href="/reservation" 
              className="group relative px-5 py-2 rounded-full bg-gradient-to-r from-[#D4982A] via-[#F0BA53] to-[#E5A93C] bg-[length:200%_100%] hover:bg-[position:100%_0] text-[#141210] font-sans font-bold text-xs tracking-wide shadow-[0_4px_15px_rgba(229,169,60,0.25)] hover:shadow-[0_6px_22px_rgba(229,169,60,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-out flex items-center gap-2 border border-white/20"
            >
              <span>View Floor Plan</span>
            </Link>
          </MagneticWrapper>
          
          {/* Store Status Capsule */}
          <button 
            onClick={onToggleStoreState}
            title="Click to toggle sanctuary operational status"
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans font-medium tracking-wide transition-all duration-300 flex items-center gap-2 border shadow-sm ${
              isStoreOpen 
                ? 'bg-emerald-950/40 text-emerald-300/90 border-emerald-800/40 hover:bg-emerald-900/40 hover:border-emerald-700/50' 
                : 'bg-amber-950/40 text-amber-300/90 border-amber-800/40 hover:bg-amber-900/40 hover:border-amber-700/50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-emerald-400/80' : 'bg-amber-400/80'}`} />
            <span>{isStoreOpen ? 'Sanctuary: Open' : 'Sanctuary: Resting'}</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl bg-[#141210]/60 border border-white/10 text-[#ECE6DD] hover:text-[#F0BA53] hover:border-[#E5A93C]/40 transition-all duration-300"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Frosted Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#141210]/95 backdrop-blur-xl border-b border-[#E5A93C]/20 px-6 py-6 shadow-[0_15px_30px_rgba(0,0,0,0.6)] space-y-4 font-sans animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col space-y-2 text-sm">
            <a 
              href="#brand-story" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#ECE6DD]/90 hover:text-[#F0BA53] hover:bg-white/5 font-medium tracking-wide transition-all"
            >
              Philosophy
            </a>
            <a 
              href="#experience" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#ECE6DD]/90 hover:text-[#F0BA53] hover:bg-white/5 font-medium tracking-wide transition-all"
            >
              The Sanctuary
            </a>
            <Link 
              href="/menu" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#ECE6DD]/90 hover:text-[#F0BA53] hover:bg-white/5 font-medium tracking-wide transition-all"
            >
              Menu & Order
            </Link>
            <a 
              href="#gallery" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#ECE6DD]/90 hover:text-[#F0BA53] hover:bg-white/5 font-medium tracking-wide transition-all"
            >
              Journal
            </a>
            <div className="pt-2">
              <Link 
                href="/reservation" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#D4982A] via-[#F0BA53] to-[#E5A93C] text-[#141210] font-bold text-xs tracking-wide shadow-[0_4px_15px_rgba(229,169,60,0.25)] flex items-center justify-center gap-2"
              >
                <span>View Floor Plan</span>
              </Link>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <button 
              onClick={() => { onToggleStoreState(); setIsMobileMenuOpen(false); }}
              className={`w-full py-2.5 rounded-full text-[11px] font-medium tracking-wide transition-all flex items-center justify-center gap-2 border ${
                isStoreOpen 
                  ? 'bg-emerald-950/40 text-emerald-300/90 border-emerald-800/40' 
                  : 'bg-amber-950/40 text-amber-300/90 border-amber-800/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-emerald-400/80' : 'bg-amber-400/80'}`} />
              <span>{isStoreOpen ? 'Sanctuary: Open for Guests' : 'Sanctuary: Resting for Tomorrow'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
