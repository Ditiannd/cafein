'use client';

import React from 'react';
import { Coffee, LogOut, LayoutDashboard, Grid2x2, Monitor, History } from 'lucide-react';
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
    <div className="min-h-screen bg-white/5 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background border-b md:border-r border-white/20 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/20">
          <Coffee className="h-6 w-6 text-[var(--color-brand-accent)] mr-2" />
          <span className="font-heading font-semibold tracking-widest uppercase text-white">Barista POS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <Link href="/barista" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/barista' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Order Queue</span>
          </Link>
          <Link href="/barista/pos" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/barista/pos' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Monitor className="w-5 h-5" />
            <span className="font-medium text-sm">Point of Sale</span>
          </Link>
          <Link href="/barista/tables" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/barista/tables' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Grid2x2 className="w-5 h-5" />
            <span className="font-medium text-sm">Store & Tables</span>
          </Link>
          <Link href="/barista/history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/barista/history' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <History className="w-5 h-5" />
            <span className="font-medium text-sm">Order History</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/20">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
