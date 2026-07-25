import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface FloatingBookingBarProps {
  onOpenDrawer: () => void;
  isVisible: boolean;
}

export function FloatingBookingBar({ onOpenDrawer, isVisible }: FloatingBookingBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 flex justify-center pointer-events-none"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-foreground/10 p-4 md:px-8 md:py-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-8 pointer-events-auto w-full max-w-4xl">
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-heading font-semibold text-lg text-foreground">Reserve Your Space</h3>
              <p className="text-sm text-[var(--color-brand-muted)]">Select a table and skip the queue.</p>
            </div>
            <div className="w-full md:w-auto">
              <Button 
                variant="luxury" 
                size="lg" 
                className="w-full"
                onClick={onOpenDrawer}
              >
                Book Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
