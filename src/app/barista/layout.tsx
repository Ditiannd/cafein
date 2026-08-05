'use client';

import React from 'react';
import { Coffee, LogOut, LayoutDashboard, Grid2x2, Monitor, History, Sparkles, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function BaristaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await api.auth.logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#141210] text-[#FFFFFF] flex flex-col md:flex-row font-sans select-none overflow-x-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#141210]/95 md:bg-[#141210] border-b md:border-r border-[#E5A93C]/20 flex flex-col shrink-0 z-20 print:hidden">
        <div className="h-20 flex items-center px-6 border-b border-[#E5A93C]/20 gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] shadow-[0_0_15px_rgba(229,169,60,0.2)] shrink-0">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-base uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>Barista POS</span>
              <Sparkles className="w-3 h-3 text-[#E5A93C]" />
            </span>
            <span className="text-[10px] text-[#C6C0B4] uppercase tracking-widest font-mono">Resort Operations v2</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 font-mono text-xs">
          <div className="px-2 pb-2 micro-label text-[#E5A93C]/70">Spatial Workflows</div>
          <Link 
            href="/barista" 
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
              pathname === '/barista' 
                ? 'bg-[#E5A93C]/15 text-[#E5A93C] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.15)] font-bold' 
                : 'text-[#C6C0B4] hover:bg-[#1E1A17]/60 hover:text-white border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span>Order Queue Board</span>
          </Link>
          <Link 
            href="/barista/pos" 
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
              pathname === '/barista/pos' 
                ? 'bg-[#E5A93C]/15 text-[#E5A93C] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.15)] font-bold' 
                : 'text-[#C6C0B4] hover:bg-[#1E1A17]/60 hover:text-white border border-transparent'
            }`}
          >
            <Monitor className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span>Point of Sale (Multi-Tab)</span>
          </Link>
          <Link 
            href="/barista/tables" 
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
              pathname === '/barista/tables' 
                ? 'bg-[#E5A93C]/15 text-[#E5A93C] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.15)] font-bold' 
                : 'text-[#C6C0B4] hover:bg-[#1E1A17]/60 hover:text-white border border-transparent'
            }`}
          >
            <Grid2x2 className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span>Canonical Table View v2</span>
          </Link>
          <Link 
            href="/barista/history" 
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
              pathname === '/barista/history' 
                ? 'bg-[#E5A93C]/15 text-[#E5A93C] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.15)] font-bold' 
                : 'text-[#C6C0B4] hover:bg-[#1E1A17]/60 hover:text-white border border-transparent'
            }`}
          >
            <History className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span>Transaction Ledger</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#E5A93C]/20 space-y-3">
          <div className="bg-[#1E1A17]/80 border border-[#E5A93C]/20 p-3 rounded-xl flex items-center gap-2.5 text-xs font-mono text-[#C6C0B4]">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-white font-bold text-[11px]">Staff Auth Session</p>
              <p className="text-[10px] text-[#C6C0B4]">Active • Station #01</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 rounded-xl transition-all font-mono text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Workspace</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Radial Grid */}
      <main className="flex-1 overflow-x-hidden flex flex-col relative bg-[#141210] print:bg-white print:overflow-visible">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none print:hidden" />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
