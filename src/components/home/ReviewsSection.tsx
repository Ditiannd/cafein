'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote } from 'lucide-react';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';

export function ReviewsSection() {
  const { data: reviews = [] } = useApiQuery('reviews', () => api.reviews.listPublic());

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-28 bg-[#141210] border-t border-white/10 relative overflow-hidden font-sans select-none">
      
      {/* Background Photography (Warm cafe photography with gentle overlay) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 fixed-bg"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2000&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Amber Glowing Background Orb */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-[#E5A93C]/10 blur-[160px] pointer-events-none z-10" />
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
              <MessageSquareQuote className="w-4 h-4 text-[#E5A93C]" />
              <span>Chapter VIII — Guest Voices</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight text-balance drop-shadow-lg"
            >
              Patron Testimonials
            </motion.h2>
          </div>
          <p className="metadata-text text-[#C6C0B4] max-w-sm leading-relaxed text-left md:text-right drop-shadow-sm font-normal">
            Reflections from guests experiencing our artisanal coffee rituals and serene seating sanctuaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="card-luxury bg-[#241E19]/50 backdrop-blur-2xl border-[#E5A93C]/25 hover:border-[#E5A93C]/55 p-8 flex flex-col justify-between h-full group shadow-[0_20px_45px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.9)] gpu-accelerated rounded-3xl"
            >
              <div>
                <div className="mb-6 border-b border-white/15 pb-4">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-[#F0BA53] text-[#F0BA53] drop-shadow-[0_0_12px_rgba(240,186,83,0.5)]" />
                    ))}
                  </div>
                </div>
                <p className="supporting-paragraph text-sm sm:text-base text-[#ECE6DD] font-normal leading-relaxed mb-8 italic drop-shadow-sm">
                  &quot;{review.comment}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <div>
                  <p className="text-[#FFFFFF] font-heading font-bold text-base tracking-wide group-hover:text-[#F0BA53] transition-colors drop-shadow-sm">{review.author}</p>
                  <p className="text-[#C6C0B4] text-xs font-sans">Sanctuary Guest</p>
                </div>
                <p className="text-[#E5A93C] font-sans text-xs font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
