'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';

export function ReviewsSection() {
  const { data: reviews = [] } = useApiQuery('reviews', () => api.reviews.listPublic());

  if (reviews.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--color-brand-dark)] border-t border-white/5 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-[var(--color-brand-accent)]/5 blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading text-white"
          >
            Words from Our Guests
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl flex flex-col h-full hover:bg-white/10 transition-colors"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]" />
                ))}
              </div>
              <p className="text-white/80 font-light leading-relaxed mb-8 flex-1 italic">
                &quot;{review.comment}&quot;
              </p>
              <div className="mt-auto">
                <p className="text-white font-medium">{review.author}</p>
                <p className="text-[var(--color-brand-accent)] text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
