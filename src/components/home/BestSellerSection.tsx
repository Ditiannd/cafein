'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';
import Link from 'next/link';

export function BestSellerSection() {
  const { data: catalog = [] } = useApiQuery('catalog', () => api.catalog.list());
  const bestSellers = catalog.filter(c => c.isBestSeller);

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm font-semibold mb-4"
            >
              Curated Selections
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-heading font-semibold text-foreground"
            >
              Our Best Sellers
            </motion.h2>
          </div>
          <Link href="/menu">
            <Button variant="outline" className="hidden md:flex">View Full Menu</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bestSellers.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-6 bg-white/5 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:bg-[var(--color-brand-accent)]">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">{item.name}</h3>
              <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed mb-4">{item.category}</p>
              <p className="font-semibold text-[var(--color-brand-accent)]">Rp {item.price.toLocaleString('id-ID')}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center md:hidden">
          <Link href="/menu">
            <Button variant="outline" className="w-full">View Full Menu</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
