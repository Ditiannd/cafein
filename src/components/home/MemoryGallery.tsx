'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';
import { Camera, Sparkles, Maximize2 } from 'lucide-react';

export function MemoryGallery() {
  const { data: images = [] } = useApiQuery('gallery', () => api.gallery.list());

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="py-28 bg-[#141210] font-sans select-none relative overflow-hidden border-t border-white/10">
      
      {/* Background Photography (Warm cafe photography with gentle overlay) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 fixed-bg"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Ambient Radial Vignette */}
      <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-[#E5A93C]/10 rounded-full blur-[180px] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-20">

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 border-b border-white/15 pb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 micro-label mb-3"
            >
              <Camera className="w-4 h-4 text-[#E5A93C]" />
              <span>Chapter VII — Memory Vault</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight text-balance drop-shadow-lg"
            >
              Visual Chronicles
            </motion.h2>
          </div>
          <p className="metadata-text text-[#C6C0B4] max-w-md leading-relaxed text-left md:text-right drop-shadow-sm font-normal">
            An interactive masonry exploration into our daily rituals, handcrafted brews, and architectural warmth. Hover to explore depth and lighting response.
          </p>
        </div>

        {/* Resort Masonry / Storytelling Grid (Clearer Hotel Glassmorphism) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {images.map((item, index) => {
            let spanClass = 'md:col-span-6 lg:col-span-4';
            if (index === 0) spanClass = 'md:col-span-12 lg:col-span-8';
            else if (index === 1) spanClass = 'md:col-span-6 lg:col-span-4';
            else if (index === 3 || index === 6) spanClass = 'md:col-span-6 lg:col-span-6';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: (index % 3) * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`card-luxury relative overflow-hidden rounded-3xl group bg-[#241E19]/50 backdrop-blur-2xl border-[#E5A93C]/25 hover:border-[#E5A93C]/55 shadow-[0_20px_45px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.9)] gpu-accelerated h-full w-full ${spanClass}`}
              >
                <div className="aspect-[16/10] sm:aspect-[4/3] w-full h-full overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.caption || `Gallery moment ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 group-hover:rotate-1"
                    loading="lazy"
                  />
                  
                  {/* Cinematic Layered Vignette & Lighting Response (Reduced overlay darkness) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/80 via-[#141210]/10 to-transparent opacity-45 group-hover:opacity-70 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[#E5A93C]/0 group-hover:bg-[#E5A93C]/20 transition-colors duration-500 pointer-events-none" />

                  {/* Top Right Action Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#141210]/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#ECE6DD] group-hover:text-[#F0BA53] group-hover:border-[#E5A93C] transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300 shadow-lg">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  
                  {/* Caption Reveal Overlay */}
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform translate-y-2 opacity-95 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-2 text-[#F0BA53] micro-label mb-1.5">
                        <Sparkles className="w-3 h-3 text-[#E5A93C]" />
                        <span>Sanctuary Chronicle 0{index + 1}</span>
                      </div>
                      <p className="text-base sm:text-lg font-heading font-bold text-[#FFFFFF] drop-shadow-lg leading-snug">{item.caption}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
