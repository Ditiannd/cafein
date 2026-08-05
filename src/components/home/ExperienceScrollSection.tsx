'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Sparkles, ShieldCheck, VolumeX, Eye, Coffee } from 'lucide-react';

export function ExperienceScrollSection() {
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

  return (
    <section 
      id="experience" 
      className="relative bg-[#141210] font-sans select-none border-t border-white/10 overflow-hidden"
    >
      {/* Background Photography with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 will-change-transform"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2000&auto=format&fit=crop")',
          y: yBg
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Ambient Radial Lighting Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[650px] h-[650px] bg-[#E5A93C]/10 rounded-full blur-[170px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#2B231D]/40 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      </div>

      {/* Story Layout */}
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
                <Compass className="w-4 h-4 text-[#E5A93C]" />
                <span>Chapter III — Spatial Sanctuary</span>
              </motion.div>
              
              <div className="overflow-hidden mb-6">
                <motion.h2 variants={textRevealVariants} className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight text-balance drop-shadow-lg">
                  Designed Around <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C]">
                    Spatial Freedom
                  </span>
                </motion.h2>
              </div>

              <div className="overflow-hidden mb-6">
                <motion.p variants={textRevealVariants} className="supporting-paragraph text-base sm:text-lg text-[#ECE6DD] max-w-md leading-relaxed font-normal drop-shadow-sm">
                  We eliminated the chaos of unguided seating. Our resort sanctuary empowers you to reserve your exact table geometry in real time before your arrival.
                </motion.p>
              </div>

              <motion.div variants={textRevealVariants} className="pt-4 grid grid-cols-2 gap-4 text-xs font-sans font-bold text-[#C6C0B4]">
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-[#E5A93C]" />
                  <span>Acoustic Serenity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#F0BA53]" />
                  <span>Curated Privacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Reserved Seating Sanctuary</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#E5A93C]" />
                  <span>Artisanal Table Service</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Interactive Spatial Showcase Cards */}
        <div className="w-full lg:w-7/12 flex flex-col gap-12 lg:gap-32 lg:pb-32">
          
          {/* Card 1: Architectural Harmony */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="gpu-accelerated card-luxury bg-[#241E19]/50 backdrop-blur-2xl border-[#E5A93C]/30 p-6 sm:p-8 rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row gap-6 items-center group"
          >
            <div className="w-full sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden relative shrink-0 border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1500&auto=format&fit=crop" 
                alt="Architectural sanctuary interior" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/50 via-transparent to-transparent opacity-35" />
              <span className="absolute bottom-3 left-3 bg-[#141210]/95 text-[#F0BA53] border border-[#E5A93C]/40 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md">
                Warm Timber & Stone
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-[#E5A93C] micro-label">
                <Compass className="w-4 h-4" />
                <span>Curated Ergonomics</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FFFFFF] tracking-tight group-hover:text-[#F0BA53] transition-colors drop-shadow-sm">
                Private Nooks & Open Lounges
              </h3>
              <p className="supporting-paragraph text-sm sm:text-base text-[#ECE6DD] font-normal">
                Whether you seek a secluded booth for quiet contemplation or a communal timber table for collaborative dialogue, our spatial geometry adapts to your intent.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Canonical Live Table Management */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="gpu-accelerated card-luxury bg-[#241E19]/60 backdrop-blur-2xl border-[#E5A93C]/45 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row gap-6 items-center group glow-amber-sm"
          >
            <div className="w-full sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden relative shrink-0 border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1500&auto=format&fit=crop" 
                alt="Table planner interface concept" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/50 via-transparent to-transparent opacity-35" />
              <span className="absolute bottom-3 left-3 bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C] text-[#141210] font-bold px-3 py-1 rounded-full text-xs tracking-wide shadow-lg">
                Interactive Geometry
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-[#E5A93C] micro-label">
                <Sparkles className="w-4 h-4" />
                <span>Seamless Floor Reservation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FFFFFF] tracking-tight group-hover:text-[#F0BA53] transition-colors drop-shadow-sm">
                Real-Time Table Reservations
              </h3>
              <p className="supporting-paragraph text-sm sm:text-base text-[#ECE6DD] font-normal">
                Trigger our floating reservation centerpiece below to explore the sanctuary floor plan. Select your preferred table and reserve your seating with effortless precision.
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
