'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { CinematicHero } from '@/components/home/CinematicHero';
import { FloatingBookingBar } from '@/components/home/FloatingBookingBar';
import { SlideDrawer } from '@/components/ui/SlideDrawer';
import { InteractiveFloorPlanMock } from '@/components/home/InteractiveFloorPlanMock';
import { MemoryGallery } from '@/components/home/MemoryGallery';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { ExperienceScrollSection } from '@/components/home/ExperienceScrollSection';
import { BestSellerSection } from '@/components/home/BestSellerSection';
import { PromotionsSection } from '@/components/home/PromotionsSection';
import { EventSection } from '@/components/home/EventSection';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  // Dual-State: Open vs Closed (Memory Mode)
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Drawer state for interactive grid
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleStoreState = () => {
    setIsStoreOpen(!isStoreOpen);
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  return (
    <main className="min-h-screen bg-background relative flex flex-col">
      <Navbar isStoreOpen={isStoreOpen} onToggleStoreState={toggleStoreState} />

      <AnimatePresence mode="wait">
        {isStoreOpen ? (
          <motion.div
            key="open-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col"
          >
            <CinematicHero />

            <ExperienceScrollSection />
            <PromotionsSection />
            <BestSellerSection />
            <EventSection />

            <div className="py-24 bg-background">
              <div className="text-center mb-12">
                <p className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm font-semibold mb-4">Atmosphere</p>
                <h2 className="text-4xl font-heading font-semibold text-foreground">The Cafein Gallery</h2>
              </div>
              <MemoryGallery />
            </div>

            <div className="h-32 bg-background"></div>

            <FloatingBookingBar
              isVisible={isStoreOpen}
              onOpenDrawer={() => setIsDrawerOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="closed-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col"
          >
            {/* Closed State Hero Message */}
            <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
              {/* Background Image Placeholder (Darker/Different vibe for closed state) */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop")', // Darker coffee shop image
                }}
              />

              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 z-10 bg-black/60" />

              {/* Hero Content */}
              <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm md:text-base mb-4 font-semibold"
                >
                  Looks like you just missed us
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-heading text-white mb-6 drop-shadow-lg"
                >
                  We&apos;re Closed
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  className="text-white/90 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-12"
                >
                  But don&apos;t worry, you can still explore our gallery and read what our guests are saying. We&apos;ll be back tomorrow to pour your perfect cup.
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
                <div className="w-4 h-4 border-b-2 border-r-2 border-white/70 transform rotate-45 translate-y-[-5px]"></div>
              </motion.div>
            </div>

            <MemoryGallery />
            <ReviewsSection />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Drawer for Booking Grid */}
      <SlideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <InteractiveFloorPlanMock />
      </SlideDrawer>
    </main>
  );
}
