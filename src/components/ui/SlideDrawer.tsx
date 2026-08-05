import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SlideDrawer({ isOpen, onClose, children }: SlideDrawerProps) {
  // Prevent scrolling when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />
          
          {/* Drawer (Clearer, warmer hotel glassmorphism) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[88vh] bg-[#1E1A17]/95 backdrop-blur-2xl border-t border-[#E5A93C]/35 text-[#FDFBF7] rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans"
          >
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/15 bg-[#141210]/80">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <h2 className="text-lg font-heading font-bold text-[#FFFFFF] tracking-tight flex items-center gap-2.5 drop-shadow-sm">
                  <span>Sanctuary Seating Reservations</span>
                  <span className="text-[10px] bg-[#E5A93C]/25 text-[#F0BA53] border border-[#E5A93C]/40 px-2.5 py-0.5 rounded-full font-sans font-bold tracking-wide shadow-sm">Live Sanctuary</span>
                </h2>
              </div>
              <button 
                onClick={onClose}
                aria-label="Close reservation panel"
                className="p-2 rounded-xl bg-[#141210] border border-white/15 hover:bg-[#241E19] text-[#C6C0B4] hover:text-[#FFFFFF] transition-all shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-[#141210]/60 flex flex-col">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
