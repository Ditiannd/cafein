'use client';

import React from 'react';
import { Coffee, LayoutDashboard, Package, Map, Users, Settings, LogOut, Grid2x2, History, CheckSquare, Image as ImageIcon, MessageSquare, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await api.auth.logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#141210] flex flex-col md:flex-row font-sans select-none text-[#ECE6DD] relative overflow-hidden">
      
      {/* Ambient Lighting Vignette for the entire admin area */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#E5A93C]/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#2B231D]/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
      </div>

      {/* Resort Executive Sidebar */}
      <aside className="w-full md:w-72 bg-[#141210]/80 backdrop-blur-3xl border-r border-white/10 flex flex-col shrink-0 shadow-2xl z-30">
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-[#141210]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] shadow-[0_0_15px_rgba(229,169,60,0.15)] animate-pulse">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold tracking-wider uppercase text-base text-transparent bg-clip-text bg-gradient-to-r from-[#F0BA53] to-[#E5A93C] block">Sanctuary</span>
              <span className="micro-label block mt-0.5 text-[#E5A93C]/80">Executive Admin</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_currentColor] animate-ping" title="Ecosystem Live" />
        </div>
        
        <div className="px-5 py-4 border-b border-white/5 bg-[#241E19]/30">
          <div className="flex items-center justify-between text-[11px] font-sans font-medium text-[#ECE6DD]/60">
            <span>Security Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified 2FA</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar font-sans text-[13px] font-medium">
          <div className="px-3 py-1.5 micro-label text-[#ECE6DD]/40">Core Governance</div>
          
          <Link href="/admin/overview" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/admin/overview' 
              ? 'bg-[#E5A93C]/10 text-[#F0BA53] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.1)] font-bold' 
              : 'text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#ECE6DD] border border-transparent hover:border-white/5'
          }`}>
            <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin/overview' ? 'text-[#E5A93C]' : 'text-[#ECE6DD]/40'}`} />
            <span>Executive Overview</span>
          </Link>

          <Link href="/admin/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/admin/inventory' 
              ? 'bg-[#E5A93C]/10 text-[#F0BA53] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.1)] font-bold' 
              : 'text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#ECE6DD] border border-transparent hover:border-white/5'
          }`}>
            <Package className={`w-4 h-4 ${pathname === '/admin/inventory' ? 'text-[#E5A93C]' : 'text-[#ECE6DD]/40'}`} />
            <span>Inventory & Stock</span>
          </Link>

          <Link href="/admin/floor-plan" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/admin/floor-plan' 
              ? 'bg-[#E5A93C]/10 text-[#F0BA53] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.1)] font-bold' 
              : 'text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#ECE6DD] border border-transparent hover:border-white/5'
          }`}>
            <Map className={`w-4 h-4 ${pathname === '/admin/floor-plan' ? 'text-[#E5A93C]' : 'text-[#ECE6DD]/40'}`} />
            <span>Floor Plan Architect</span>
          </Link>

          <div className="px-3 pt-4 pb-1.5 micro-label text-[#ECE6DD]/40">Patron Experience</div>

          <Link href="/admin/gallery" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/admin/gallery' 
              ? 'bg-[#E5A93C]/10 text-[#F0BA53] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.1)] font-bold' 
              : 'text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#ECE6DD] border border-transparent hover:border-white/5'
          }`}>
            <ImageIcon className={`w-4 h-4 ${pathname === '/admin/gallery' ? 'text-[#E5A93C]' : 'text-[#ECE6DD]/40'}`} />
            <span>Memory Gallery Vault</span>
          </Link>

          <Link href="/admin/reviews" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/admin/reviews' 
              ? 'bg-[#E5A93C]/10 text-[#F0BA53] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.1)] font-bold' 
              : 'text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#ECE6DD] border border-transparent hover:border-white/5'
          }`}>
            <MessageSquare className={`w-4 h-4 ${pathname === '/admin/reviews' ? 'text-[#E5A93C]' : 'text-[#ECE6DD]/40'}`} />
            <span>Patron Testimonials</span>
          </Link>

          <div className="px-3 pt-4 pb-1.5 micro-label text-[#ECE6DD]/40">Personnel & Catalog</div>

          <Link href="/admin/staff" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/admin/staff' 
              ? 'bg-[#E5A93C]/10 text-[#F0BA53] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.1)] font-bold' 
              : 'text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#ECE6DD] border border-transparent hover:border-white/5'
          }`}>
            <Users className={`w-4 h-4 ${pathname === '/admin/staff' ? 'text-[#E5A93C]' : 'text-[#ECE6DD]/40'}`} />
            <span>Staff Roster Manager</span>
          </Link>

          <Link href="/admin/catalog" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            pathname === '/admin/catalog' 
              ? 'bg-[#E5A93C]/10 text-[#F0BA53] border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.1)] font-bold' 
              : 'text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#ECE6DD] border border-transparent hover:border-white/5'
          }`}>
            <Settings className={`w-4 h-4 ${pathname === '/admin/catalog' ? 'text-[#E5A93C]' : 'text-[#ECE6DD]/40'}`} />
            <span>Catalog & Content</span>
          </Link>

          <div className="px-3 pt-4 pb-1.5 micro-label text-[#ECE6DD]/40">Station Bridges</div>

          <Link href="/barista" className="flex items-center justify-between px-4 py-3 rounded-xl text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#F0BA53] transition-all duration-300 border border-transparent hover:border-white/5 group">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 text-[#ECE6DD]/40 group-hover:text-[#F0BA53] transition-colors" />
              <span>Order Queue Board</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#ECE6DD]/30 group-hover:text-[#F0BA53]/70 transition-colors" />
          </Link>

          <Link href="/barista/pos" className="flex items-center justify-between px-4 py-3 rounded-xl text-[#ECE6DD]/60 hover:bg-[#241E19]/40 hover:text-[#F0BA53] transition-all duration-300 border border-transparent hover:border-white/5 group">
            <div className="flex items-center gap-3">
              <Grid2x2 className="w-4 h-4 text-[#ECE6DD]/40 group-hover:text-[#F0BA53] transition-colors" />
              <span>POS Station Gateway</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#ECE6DD]/30 group-hover:text-[#F0BA53]/70 transition-colors" />
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#141210]/50 font-sans text-xs">
          <button 
            onClick={handleSignOut} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded-xl transition-all duration-300 font-bold shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Executive Session</span>
          </button>
        </div>
      </aside>

      {/* Main Executive Workspace Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
