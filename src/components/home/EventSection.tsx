'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';

export function EventSection() {
  const { data: events = [] } = useApiQuery('events', () => api.events.listPublic());

  if (events.length === 0) return null;

  return (
    <section className="py-24 bg-[#141210] border-t border-white/10 font-sans select-none relative overflow-hidden">
      
      {/* Background Photography (Warm cafe events photography with gentle overlay) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 fixed-bg"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=2000&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Background Radial Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2 micro-label mb-3"
          >
            <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            <span>Chapter VI — Community & Gatherings</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold text-[#FFFFFF] tracking-tight drop-shadow-lg"
          >
            Upcoming Gatherings
          </motion.h2>
          <p className="mt-3 text-[#ECE6DD] text-sm sm:text-base font-normal drop-shadow-sm">Immerse yourself in sensory tastings, pour-over workshops, and quiet acoustic evenings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="card-luxury group bg-[#241E19]/50 backdrop-blur-2xl rounded-3xl overflow-hidden border-[#E5A93C]/25 hover:border-[#E5A93C]/50 flex flex-col sm:flex-row transition-all duration-500 shadow-[0_20px_45px_rgba(0,0,0,0.7)]"
            >
              <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto relative overflow-hidden shrink-0 border-r border-white/15 bg-[#141210]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#141210]/50 via-transparent to-transparent opacity-35" />
              </div>
              <div className="p-8 sm:p-10 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-2 text-[#F0BA53] mb-3 bg-[#E5A93C]/20 border border-[#E5A93C]/40 px-3 py-1 rounded-full w-fit shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-sans font-bold text-xs tracking-wide">{event.date}</span>
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3 text-[#FFFFFF] group-hover:text-[#F0BA53] transition-colors drop-shadow-sm">{event.title}</h3>
                <p className="text-[#ECE6DD] text-xs md:text-sm leading-relaxed mb-6 font-normal">{event.description}</p>
                <button 
                  title="Reserve your attendance spot"
                  className="text-[#FFFFFF] font-sans font-bold text-xs tracking-wide flex items-center gap-2 group-hover:text-[#F0BA53] transition-colors w-fit bg-[#141210]/80 px-4 py-2.5 rounded-xl border border-white/15 group-hover:border-[#E5A93C]/50 shadow-md backdrop-blur-md"
                >
                  <span>Reserve Attendance</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-[#E5A93C]" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
