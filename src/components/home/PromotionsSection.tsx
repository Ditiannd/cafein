'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';

export function PromotionsSection() {
  const { data: catalog = [] } = useApiQuery('catalog', () => api.catalog.list());

  // Filter catalog items that have promotions (discount data comes joined from the API)
  const promoItems = catalog
    .filter(item => item.discountType && item.discountValue)
    .map(item => {
      let finalPrice = item.price;
      let badgeText = '';

      if (item.discountType === 'percentage') {
        finalPrice = item.price * (1 - item.discountValue! / 100);
        badgeText = `${item.discountValue}% OFF`;
      } else {
        finalPrice = Math.max(0, item.price - item.discountValue!);
        badgeText = `SAVE Rp ${(item.discountValue! / 1000).toFixed(0)}k`;
      }

      return { ...item, finalPrice, badgeText };
    });

  if (promoItems.length === 0) return null;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm font-semibold mb-4"
          >
            Special Offers
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-semibold text-foreground"
          >
            Current Promotions
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {promoItems.map((promo, idx) => (
            <motion.div 
              key={promo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-white/5 border border-[var(--color-brand-accent)]/30 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={promo.image} 
                  alt={promo.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform">
                  {promo.badgeText}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-heading font-semibold text-white mb-2">{promo.name}</h3>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold text-[var(--color-brand-accent)]">
                    Rp {promo.finalPrice.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm text-gray-400 line-through mb-1">
                    Rp {promo.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
