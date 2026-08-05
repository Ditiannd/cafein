'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Award, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';
import Link from 'next/link';

export function BestSellerSection() {
  const { data: catalog = [] } = useApiQuery('catalog', () => api.catalog.list());
  const [activeTab, setActiveTab] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(catalog.map(c => c.category || 'General')))].slice(0, 5) as string[];

  const filteredItems = catalog.filter(item => {
    if (activeTab === 'All') return item.isBestSeller || catalog.indexOf(item) < 6;
    return (item.category || 'General') === activeTab;
  }).slice(0, 6);

  if (catalog.length === 0) return null;

  return (
    <section className="py-28 bg-[#141210] relative overflow-hidden font-sans select-none border-t border-white/10">
      
      {/* Background Photography (Warm cafe photography with gentle overlay) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 fixed-bg"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=2000&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/70 to-[#141210]/90 pointer-events-none" />

      {/* Ambient Lighting Vignette */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#E5A93C]/10 rounded-full blur-[170px] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-20">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 border-b border-white/15 pb-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 micro-label mb-3"
            >
              <Award className="w-4 h-4 text-[#E5A93C]" />
              <span>Chapter V — Resort Collections</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFFFFF] tracking-tight text-balance drop-shadow-lg"
            >
              Curated Signatures
            </motion.h2>
          </div>

          {/* Interactive Category Tabs (Frosted Pills with Rich Gold Active States) */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-xs font-sans tracking-wide transition-all duration-300 flex items-center gap-2 shadow-sm ${
                  activeTab === cat
                    ? 'bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C] text-[#141210] font-bold shadow-[0_0_20px_rgba(229,169,60,0.4)] scale-105'
                    : 'bg-[#241E19]/70 text-[#ECE6DD] border border-white/15 hover:text-[#FFFFFF] hover:border-[#E5A93C]/40 backdrop-blur-md'
                }`}
              >
                <span>{cat}</span>
                {activeTab === cat && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="card-luxury group cursor-pointer bg-[#241E19]/50 backdrop-blur-2xl border-[#E5A93C]/25 hover:border-[#E5A93C]/55 p-5 flex flex-col justify-between gpu-accelerated shadow-[0_20px_45px_rgba(0,0,0,0.7)]"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-5 bg-[#141210] relative border border-white/15">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/60 via-transparent to-transparent opacity-35 group-hover:opacity-50 transition-opacity duration-300" />
                    {item.isBestSeller && (
                      <div className="absolute top-3 left-3 bg-[#E5A93C]/25 backdrop-blur-md border border-[#E5A93C]/50 text-[#F0BA53] text-xs font-bold px-3 py-1 rounded-full tracking-wide shadow-lg">
                        ★ Patron Favorite
                      </div>
                    )}
                    <Link href={`/menu?item=${item.id}`}>
                      <button 
                        title="Add signature selection to order"
                        className="absolute bottom-4 right-4 w-11 h-11 bg-gradient-to-r from-[#F0BA53] to-[#E5A93C] text-[#141210] rounded-full flex items-center justify-center opacity-90 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(229,169,60,0.4)] hover:scale-105 font-bold"
                      >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-xl font-heading font-bold text-[#FFFFFF] group-hover:text-[#F0BA53] transition-colors drop-shadow-sm">{item.name}</h3>
                    <span className="font-heading font-bold text-[#F0BA53] text-lg drop-shadow-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-[#C6C0B4] text-xs font-sans tracking-wide mb-4 font-normal">{item.category}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs font-sans text-[#C6C0B4] font-medium">
                  <span>Prepared in 5 mins</span>
                  <span className="text-emerald-400 font-bold">● Crafted for Sanctuary Service</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA to Full Catalog */}
        <div className="mt-16 text-center">
          <Link href="/menu">
            <Button variant="luxury" size="lg" className="px-10 py-6 text-xs gap-3 shadow-[0_0_30px_rgba(229,169,60,0.3)] rounded-full font-bold">
              <Sparkles className="w-4 h-4 text-[#141210]" />
              <span>Explore Complete Online Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
