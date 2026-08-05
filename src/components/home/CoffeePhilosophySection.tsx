'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Flame, Droplets } from 'lucide-react';

export function CoffeePhilosophySection() {
  return (
    <section 
      id="coffee-philosophy" 
      className="relative bg-[#141210] font-sans select-none border-t border-white/10"
    >
      {/* Background Photography */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop")',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Ambient Radial Lighting Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-[#E5A93C]/10 rounded-full blur-[170px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
      </div>

      {/* Narrative Layout */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-48 flex flex-col-reverse lg:flex-row gap-12 lg:gap-24 z-20">
        
        {/* Left Column: Parallax Image Showcase & Narrative Cards */}
        <div className="w-full lg:w-7/12 flex flex-col gap-12 lg:gap-32 lg:pb-32">
          
          {/* Card 1: Sustainable Sourcing */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="gpu-accelerated card-luxury bg-[#241E19]/50 backdrop-blur-2xl border-[#E5A93C]/25 p-6 sm:p-8 rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row gap-6 items-center"
          >
            <div className="w-full sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden relative shrink-0 border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop" 
                alt="Green coffee beans" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              {/* Reduced image overlay darkness from 80%/60% down to 50%/30% to let green harvest colors pop */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/50 via-transparent to-transparent opacity-35" />
              <span className="absolute bottom-3 left-3 bg-[#141210]/95 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md">
                100% Traceable
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-emerald-400 micro-label">
                <Droplets className="w-4 h-4" />
                <span>Single Origin Harvest</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FFFFFF] tracking-tight drop-shadow-sm">
                High-Altitude Volcanic Soil
              </h3>
              <p className="supporting-paragraph text-sm sm:text-base text-[#ECE6DD] font-normal">
                Partnering exclusively with micro-lot farmers in Bali, Ethiopia, and Colombia to harvest cherries at peak sweetness and natural complexity.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Artisanal Roasting */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="gpu-accelerated card-luxury bg-[#241E19]/55 backdrop-blur-2xl border-[#E5A93C]/35 p-6 sm:p-8 rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row gap-6 items-center glow-amber-sm"
          >
            <div className="w-full sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden relative shrink-0 border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1000&auto=format&fit=crop" 
                alt="Coffee roasting drum" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/50 via-transparent to-transparent opacity-35" />
              <span className="absolute bottom-3 left-3 bg-[#141210]/95 text-[#F0BA53] border border-[#E5A93C]/50 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md">
                Small-Batch Roast
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-[#E5A93C] micro-label">
                <Flame className="w-4 h-4 text-[#E5A93C] animate-pulse" />
                <span>Precision Roasting</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FFFFFF] tracking-tight drop-shadow-sm">
                Unlock the Caramel Resonance
              </h3>
              <p className="supporting-paragraph text-sm sm:text-base text-[#ECE6DD] font-normal">
                Roasting in small 5kg drums in-house allows us to calibrate thermal curves, preserving delicate jasmine aromas and rich dark chocolate undertones.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Ritual Brewing Mastery */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="gpu-accelerated card-luxury bg-[#241E19]/60 backdrop-blur-2xl border-[#E5A93C]/45 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row gap-6 items-center glow-amber"
          >
            <div className="w-full sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden relative shrink-0 border border-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1500&auto=format&fit=crop" 
                alt="Pour over coffee preparation" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/50 via-transparent to-transparent opacity-35" />
              <span className="absolute bottom-3 left-3 bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C] text-[#141210] font-bold px-3 py-1 rounded-full text-xs tracking-wide shadow-lg">
                Signature Ritual
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-[#E5A93C] micro-label">
                <Coffee className="w-4 h-4" />
                <span>Hand-Poured Mastery</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FFFFFF] tracking-tight drop-shadow-sm">
                93°C Water Calibration
              </h3>
              <p className="supporting-paragraph text-sm sm:text-base text-[#ECE6DD] font-normal">
                Each cup is extracted using temperature-controlled pour-over gooseneck systems, ensuring zero bitterness and a silky, memorable finish.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Pinned Chapter Title */}
        <div className="w-full lg:w-5/12">
          <div className="sticky top-32 lg:pl-6 border-l-0 lg:border-l border-white/15">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2.5 micro-label">
                <Coffee className="w-4 h-4 text-[#E5A93C]" />
                <span>Chapter II — The Craft & Ritual</span>
              </div>
              
              <h2 className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight text-balance drop-shadow-lg">
                From Volcanic Peak to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C]">
                  Your Porcelain Cup
                </span>
              </h2>

              <p className="supporting-paragraph text-base sm:text-lg text-[#ECE6DD] max-w-md leading-relaxed font-normal drop-shadow-sm">
                We reject industrial automation in favor of human craftsmanship, sensory vigilance, and uncompromised ingredient integrity.
              </p>

              <div className="pt-4 flex items-center gap-6 text-xs font-sans font-bold text-[#C6C0B4]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <span>Ethically Traced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] animate-pulse shadow-[0_0_10px_rgba(229,169,60,0.5)]" />
                  <span>93°C Extraction</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
