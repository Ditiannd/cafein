'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function PromotionsSection() {
  const { data: catalog = [] } = useApiQuery('catalog', () => api.catalog.list());

  const promoItems = catalog
    .filter(item => item.discountType && item.discountValue)
    .map(item => {
      let finalPrice = item.price;
      let badgeText = '';

      if (item.discountType === 'percentage') {
        finalPrice = item.price * (1 - item.discountValue! / 100);
        badgeText = `${item.discountValue}% Privileged`;
      } else {
        finalPrice = Math.max(0, item.price - item.discountValue!);
        badgeText = `Save Rp ${(item.discountValue! / 1000).toFixed(0)}k`;
      }

      return { ...item, finalPrice, badgeText };
    });

  if (promoItems.length === 0) return null;

  return (
    <section className="py-28 bg-[#141210] relative overflow-hidden font-sans select-none border-t border-white/10">
      
      {/* Background Photography (Warm cafe photography with gentle overlay) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 fixed-bg"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2000&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Ambient Lighting Vignette */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#E5A93C]/10 rounded-full blur-[170px] pointer-events-none z-10" />
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
              <Tag className="w-4 h-4 text-[#E5A93C]" />
              <span>Chapter IV — Seasonal Privileges</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight text-balance drop-shadow-lg"
            >
              Curated Privileges
            </motion.h2>
          </div>
          <p className="metadata-text text-[#C6C0B4] max-w-sm leading-relaxed text-left md:text-right drop-shadow-sm font-normal">
            Exclusive seasonal privileges on signature creations, curated for our guests and synchronized in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promoItems.map((promo, idx) => (
            <motion.div 
              key={promo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="card-luxury group relative bg-[#241E19]/50 backdrop-blur-2xl border-[#E5A93C]/25 rounded-3xl overflow-hidden hover:border-[#E5A93C]/50 transition-all duration-500 shadow-[0_20px_45px_rgba(0,0,0,0.7)] p-5 flex flex-col justify-between gpu-accelerated"
            >
              <div>
                <div className="aspect-[4/3] w-full overflow-hidden relative rounded-2xl bg-[#141210] border border-white/15 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={promo.image} 
                    alt={promo.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Reduced overlay darkness to let artisan creations pop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/60 via-transparent to-transparent opacity-35" />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C] text-[#141210] text-xs font-bold px-3.5 py-1.5 rounded-full tracking-wide shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-[#141210]" />
                    <span>{promo.badgeText}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-heading font-bold text-[#FFFFFF] mb-2 group-hover:text-[#F0BA53] transition-colors drop-shadow-sm">{promo.name}</h3>
                <p className="supporting-paragraph text-sm text-[#ECE6DD] line-clamp-2 mb-6 font-normal">Handcrafted signature selection with seasonal ingredients and resort-grade precision.</p>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-heading font-bold text-[#F0BA53] drop-shadow-sm">
                    Rp {promo.finalPrice.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-sans text-[#C6C0B4] line-through">
                    Rp {promo.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <Link href={`/menu?item=${promo.id}`}>
                  <span className="text-xs font-sans font-bold text-[#E5A93C] hover:text-[#FFFFFF] tracking-wide flex items-center gap-1 transition-colors group-hover:translate-x-1 duration-300">
                    <span>Reserve Selection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
