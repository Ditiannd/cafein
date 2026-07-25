'use client';

import React from 'react';
import { Coffee, LayoutDashboard, Package, Map, Users, Settings, LogOut, Grid2x2, History, CheckSquare, Image as ImageIcon, MessageSquare } from 'lucide-react';
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
    <div className="min-h-screen bg-white/5 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--color-brand-dark)] flex flex-col text-white">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Coffee className="h-6 w-6 text-[var(--color-brand-accent)] mr-2" />
          <span className="font-heading font-semibold tracking-widest uppercase text-sm">Admin Portal</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <Link href="/admin/overview" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/overview' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <LayoutDashboard className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Overview</span>
          </Link>
          <Link href="/admin/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/inventory' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <Package className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Inventory</span>
          </Link>
          <Link href="/admin/floor-plan" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/floor-plan' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <Map className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Floor Planner</span>
          </Link>
          <Link href="/admin/gallery" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/gallery' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <ImageIcon className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Gallery</span>
          </Link>
          <Link href="/admin/reviews" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/reviews' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Reviews</span>
          </Link>
          <Link href="/admin/staff" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/staff' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <Users className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Staff Manager</span>
          </Link>
          <Link href="/admin/catalog" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/catalog' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Content Settings</span>
          </Link>
          <Link href="/barista" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/barista' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <CheckSquare className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Order Queue</span>
          </Link>
          <Link href="/barista/tables" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/barista/tables' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <Grid2x2 className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Store & Tables</span>
          </Link>
          <Link href="/barista/history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/barista/history' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'hover:bg-white/10'}`}>
            <History className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-sm">Order History</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
