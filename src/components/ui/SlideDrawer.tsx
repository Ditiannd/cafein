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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] bg-background rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-foreground/10">
              <h2 className="text-xl font-heading font-semibold">Interactive Floor Plan</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <X className="h-6 w-6 text-foreground" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-background">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
