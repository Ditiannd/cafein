'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

export function BrandStorySection() {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const textRevealVariants = {
    hidden: { opacity: 0, y: "100%" },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <section 
      id="brand-story" 
      className="relative bg-[#141210] font-sans select-none border-t border-white/10 overflow-hidden"
    >
      {/* Background Photography with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 will-change-transform"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2000&auto=format&fit=crop")',
          y: yBg
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Ambient Lighting Vignette */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[550px] h-[550px] bg-[#E5A93C]/10 rounded-full blur-[170px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#2B231D]/50 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      </div>

      {/* Story Content Layout */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-48 flex flex-col lg:flex-row gap-12 lg:gap-24 z-20">
        
        {/* Left Column: Pinned Chapter Title */}
        <div className="w-full lg:w-5/12">
          <div className="sticky top-32 space-y-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
            >
              <motion.div variants={textRevealVariants} className="flex items-center gap-2.5 micro-label mb-6">
                <Compass className="w-4 h-4 text-[#E5A93C] animate-spin-slow" />
                <span>Chapter I — Brand Philosophy</span>
              </motion.div>
              
              <div className="overflow-hidden mb-6">
                <motion.h2 variants={textRevealVariants} className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight text-balance drop-shadow-lg">
                  A Sanctuary in <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C]">
                    The Hurried City
                  </span>
                </motion.h2>
              </div>

              <div className="overflow-hidden mb-6">
                <motion.p variants={textRevealVariants} className="supporting-paragraph text-base sm:text-lg text-[#ECE6DD] max-w-md leading-relaxed font-normal drop-shadow-sm">
                  We believe that exceptional coffee is not merely consumed—it is experienced as a restorative ritual of focus, warmth, and quiet connection.
                </motion.p>
              </div>
              
              <motion.div variants={textRevealVariants} className="pt-4 flex items-center gap-3">
                <span className="h-[1px] w-12 bg-[#E5A93C]/50" />
                <span className="text-xs font-sans tracking-resort-wide text-[#E5A93C] font-bold">
                  Scroll to Explore
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Scrolling Narrative Blocks */}
        <div className="w-full lg:w-6/12 flex flex-col gap-12 lg:gap-32 lg:pb-32">
          
          {/* Narrative Block 1 */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-20%" }}
            variants={blockVariants}
            className="gpu-accelerated p-8 sm:p-10 card-luxury bg-[#241E19]/50 backdrop-blur-2xl border-[#E5A93C]/25 shadow-[0_20px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(229,169,60,0.12)] rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6 border-b border-white/15 pb-4">
              <span className="micro-label text-[#F0BA53]">01 / Intention Over Speed</span>
              <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            </div>
            <p className="supporting-paragraph text-lg sm:text-xl text-[#FFFFFF] font-normal leading-relaxed drop-shadow-sm">
              &quot;In an era dominated by hurried transactions and noise, Cafein Today was conceived as a deliberate pause—an architectural haven where time softens, conversations deepen, and every brew is treated as an art form.&quot;
            </p>
          </motion.div>

          {/* Narrative Block 2 */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-20%" }}
            variants={blockVariants}
            className="gpu-accelerated p-8 sm:p-10 card-luxury bg-[#241E19]/55 backdrop-blur-2xl border-[#E5A93C]/30 shadow-[0_20px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(229,169,60,0.15)] rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6 border-b border-white/15 pb-4">
              <span className="micro-label text-[#F0BA53]">02 / Resort-Grade Hospitality</span>
              <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            </div>
            <p className="supporting-paragraph text-lg sm:text-xl text-[#FFFFFF] font-normal leading-relaxed drop-shadow-sm">
              &quot;Drawing inspiration from world-class luxury destinations, every acoustic contour, warm material, and spatial table arrangement is curated to provide an atmosphere of uncompromised comfort and serene privacy.&quot;
            </p>
          </motion.div>

          {/* Narrative Block 3 */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-20%" }}
            variants={blockVariants}
            className="gpu-accelerated p-8 sm:p-10 card-luxury bg-[#241E19]/60 backdrop-blur-2xl border-[#E5A93C]/40 shadow-[0_20px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(229,169,60,0.2)] glow-amber-sm rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6 border-b border-white/15 pb-4">
              <span className="micro-label text-[#F0BA53]">03 / Sanctuary Seating</span>
              <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            </div>
            <p className="supporting-paragraph text-lg sm:text-xl text-[#FFFFFF] font-normal leading-relaxed drop-shadow-sm">
              &quot;Our spatial table reservation system allows you to select your preferred seating sanctuary before arrival, ensuring your experience is calm, seamless, and elevated from the very first moment.&quot;
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
