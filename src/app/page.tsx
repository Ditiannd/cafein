'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { CinematicHero } from '@/components/home/CinematicHero';
import { BrandStorySection } from '@/components/home/BrandStorySection';
import { CoffeePhilosophySection } from '@/components/home/CoffeePhilosophySection';
import { ExperienceScrollSection } from '@/components/home/ExperienceScrollSection';
import { PromotionsSection } from '@/components/home/PromotionsSection';
import { BestSellerSection } from '@/components/home/BestSellerSection';
import { EventSection } from '@/components/home/EventSection';
import { MemoryGallery } from '@/components/home/MemoryGallery';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { FloatingDock } from '@/components/home/FloatingDock';
import { SlideDrawer } from '@/components/ui/SlideDrawer';
import { InteractiveFloorPlanMock } from '@/components/home/InteractiveFloorPlanMock';
import { Footer } from '@/components/layout/Footer';
import { Moon, ChevronDown } from 'lucide-react';

export default function Home() {
  // Dual-State: Open vs Closed (Sanctuary After Hours Mode)
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleStoreState = () => {
    setIsStoreOpen(!isStoreOpen);
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#141210] text-[#FFFFFF] relative flex flex-col font-sans select-none overflow-x-hidden">
      <Navbar isStoreOpen={isStoreOpen} onToggleStoreState={toggleStoreState} />

      <AnimatePresence mode="wait">
        {isStoreOpen ? (
          <motion.div
            key="open-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Chapter I: Hero Experience (Title Evolution & Parallax) */}
            <CinematicHero />

            {/* Chapter II: Brand Philosophy (Sticky Story Section) */}
            <BrandStorySection />

            {/* Chapter III: The Craft & Ritual (Sticky Story Section) */}
            <CoffeePhilosophySection />

            {/* Chapter IV: Spatial Sanctuary Experience (Sticky Story Section) */}
            <ExperienceScrollSection />

            {/* Chapter V: Seasonal Privileges (Curated Promotions) */}
            <PromotionsSection />

            {/* Chapter VI: Resort Collections & Best Sellers */}
            <BestSellerSection />

            {/* Chapter VII: Community & Gatherings */}
            <EventSection />

            {/* Chapter VIII: Memory Vault (Resort Masonry & Storytelling) */}
            <MemoryGallery />

            {/* Chapter IX: Patron Testimonials & Guest Voices */}
            <ReviewsSection />

            <div className="h-28 bg-[#141210]" />

            {/* Interactive Reserve Centerpiece (Floating Dock & Apple Maps Drawer Trigger) */}
            <FloatingDock
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
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Closed State Sanctuary Mode */}
            <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#141210]">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate] gpu-accelerated opacity-80"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop")',
                }}
              />
              {/* Reduced overlay darkness to let evening cafe photography pop */}
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#141210]/60 via-[#141210]/40 to-[#141210]/85 pointer-events-none" />

              <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#F0BA53] micro-label mb-8 shadow-[0_0_25px_rgba(229,169,60,0.3)] backdrop-blur-md"
                >
                  <Moon className="w-3.5 h-3.5 animate-pulse text-[#E5A93C]" />
                  <span>Sanctuary in Repose</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="hero-title text-4xl md:text-6xl lg:text-8xl text-[#FFFFFF] mb-6 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] tracking-tight text-balance font-bold"
                >
                  We Are Restoring for Tomorrow
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  className="supporting-paragraph text-base md:text-xl max-w-2xl mx-auto mb-12 text-[#ECE6DD] font-normal tracking-wide text-balance drop-shadow-md"
                >
                  Our seating sanctuary is resting for tomorrow&apos;s service. You are welcome to explore our visual chronicles and patron reflections in the meantime.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
                className="absolute bottom-16 z-20 flex flex-col items-center text-[#C6C0B4] animate-bounce cursor-pointer pointer-events-none drop-shadow-md"
              >
                <span className="micro-label text-[10px] text-[#F0BA53] mb-2 font-bold">Scroll to Explore</span>
                <ChevronDown className="h-5 w-5 text-[#F0BA53] stroke-[2.5]" />
              </motion.div>
            </div>

            <MemoryGallery />
            <ReviewsSection />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Apple Maps-Style Spatial Live Floor Planner Drawer */}
      <SlideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <InteractiveFloorPlanMock />
      </SlideDrawer>
    </main>
  );
}
