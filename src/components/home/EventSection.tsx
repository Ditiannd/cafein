'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';

export function EventSection() {
  const { data: events = [] } = useApiQuery('events', () => api.events.listPublic());

  if (events.length === 0) return null;

  return (
    <section className="py-24 bg-background border-t border-[var(--color-brand-muted)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm font-semibold mb-4"
          >
            Community
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-semibold text-foreground"
          >
            Upcoming Events
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 flex flex-col sm:flex-row hover:bg-white/10 transition-all duration-500"
            >
              <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto relative overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8 sm:p-10 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-2 text-[var(--color-brand-accent)] mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold text-sm tracking-widest">{event.date}</span>
                </div>
                <h3 className="text-2xl font-heading font-semibold mb-3 text-foreground">{event.title}</h3>
                <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed mb-6">{event.description}</p>
                <button className="text-[var(--color-brand-light)] font-semibold text-sm uppercase tracking-wider flex items-center gap-2 group-hover:text-[var(--color-brand-accent)] transition-colors w-fit">
                  Reserve Spot <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
