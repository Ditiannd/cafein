import React from 'react';
import { motion } from 'framer-motion';

export function ExperienceScrollSection() {
  return (
    <section className="bg-background py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section 1: The Craft */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6"
          >
            <p className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm font-semibold">The Craft</p>
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground leading-tight">
              Artisan Roasts &<br/> Precision Brewing
            </h2>
            <p className="text-[var(--color-brand-muted)] text-lg leading-relaxed max-w-lg">
              Every bean is carefully selected from sustainable farms and roasted in-house to bring out its unique profile. Experience coffee that tells a story from farm to cup.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="flex-1 w-full"
          >
            <div className="aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1500&auto=format&fit=crop" 
                alt="Barista pouring coffee" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </motion.div>
        </div>

        {/* Section 2: The Space */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="flex-1 w-full"
          >
            <div className="aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1500&auto=format&fit=crop" 
                alt="Cafe interior design" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6"
          >
            <p className="text-[var(--color-brand-accent)] uppercase tracking-[0.3em] text-sm font-semibold">The Space</p>
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground leading-tight">
              A Sanctuary for <br/> Focus & Connection
            </h2>
            <p className="text-[var(--color-brand-muted)] text-lg leading-relaxed max-w-lg">
              Designed with a blend of minimalist luxury and warm tones, our space provides the perfect environment for both deep work and meaningful conversations. 
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
