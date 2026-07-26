'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { InteractiveFloorPlanMock } from '@/components/home/InteractiveFloorPlanMock';

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Interactive Table Booking</h1>
              <p className="text-[11px] text-zinc-400">Select an available table directly from our canonical floor plan.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>90-Min Standard Seating</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Reserve Your Experience</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Whether you are joining us for a casual coffee, co-working session, or VIP private gathering, our spatial floor planner allows you to pick the exact table geometry and seating location that fits your vibe.
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          <InteractiveFloorPlanMock />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 px-6 text-center text-xs text-zinc-500 font-mono">
        Cafein Today Canonical Table Management v2.0 • All reservations subject to 15-minute grace period arrival policy.
      </footer>
    </div>
  );
}
