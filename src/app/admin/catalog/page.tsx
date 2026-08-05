'use client';

import React, { useState } from 'react';
import { Search, X, Settings, List, Save, Calendar, Tag, Sparkles, Coffee, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api, CatalogItem } from '@/lib/api';

export default function CatalogManagerPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'events' | 'settings'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: catalog = [], refetch: refetchCatalog } = useApiQuery('catalog', () => api.catalog.list());
  const { data: events = [] } = useApiQuery('events', () => api.events.listPublic());

  // Discount Management State
  const [discountModalItem, setDiscountModalItem] = useState<CatalogItem | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const openDiscountModal = (item: CatalogItem) => {
    setDiscountModalItem(item);
    if (item.discountType && item.discountValue) {
      setDiscountType(item.discountType);
      setDiscountValue(item.discountValue.toString());
    } else {
      setDiscountType('percentage');
      setDiscountValue('');
    }
  };

  const handleSaveDiscount = async () => {
    if (discountModalItem) {
      try {
        if (!discountValue || parseInt(discountValue) <= 0) {
          await api.promotions.delete(discountModalItem.id);
        } else {
          await api.promotions.upsert({
            catalogItemId: discountModalItem.id,
            discountType,
            discountValue: parseInt(discountValue),
          });
        }
        refetchCatalog();
      } catch (err) {
        console.error('Failed to save discount:', err);
      }
      setDiscountModalItem(null);
    }
  };

  const getPromoDetails = (item: CatalogItem) => {
    if (!item.discountType || !item.discountValue) return null;
    
    if (item.discountType === 'percentage') {
      return { type: 'percentage', finalPrice: item.price * (1 - item.discountValue / 100), value: item.discountValue };
    } else {
      return { type: 'fixed', finalPrice: Math.max(0, item.price - item.discountValue), value: item.discountValue };
    }
  };

  return (
    <div className="p-8 h-full flex flex-col font-sans select-none text-zinc-100 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Content & Catalog Governance</h1>
            <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">Resort CMS</span>
          </div>
          <p className="text-zinc-400 text-xs font-mono mt-1">Configure artisanal product pricing, active promotions, resort happenings, and payment gateway rules.</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 font-mono text-xs">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'catalog' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <List className="w-4 h-4 text-amber-400" />
          <span>● Menu Catalog (& Discounts)</span>
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'events' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>○ Resort Happenings</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'settings' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>○ Payment Rules</span>
        </button>
      </div>

      {activeTab === 'catalog' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-luxury bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 flex-1 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80 font-mono">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search catalog products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-600"
              />
            </div>
            <span className="text-zinc-500 text-xs font-mono font-bold">Total Items: {catalog.length}</span>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-bold bg-zinc-950/80 tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Pricing & Promo</th>
                  <th className="py-4 px-6">Badge Tag</th>
                  <th className="py-4 px-6">Best Seller</th>
                  <th className="py-4 px-6 text-right">Promo Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {catalog.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
                  const promo = getPromoDetails(item);
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/90 transition-all group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <span className="font-heading font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs uppercase">{item.category}</td>
                      <td className="py-4 px-6 font-mono">
                        {promo ? (
                          <div className="flex flex-col">
                            <span className="text-amber-400 font-extrabold text-sm">Rp {promo.finalPrice.toLocaleString('id-ID')}</span>
                            <span className="line-through text-[10px] text-zinc-500">Rp {item.price.toLocaleString('id-ID')} ({promo.type === 'percentage' ? `-${promo.value}%` : 'PROMO'})</span>
                          </div>
                        ) : (
                          <span className="text-white font-bold text-xs">Rp {item.price.toLocaleString('id-ID')}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        {item.badge && item.badge !== '-' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          item.isBestSeller 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-zinc-800/50 text-zinc-500'
                        }`}>
                          {item.isBestSeller ? '● YES' : '○ NO'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono">
                        <button 
                          onClick={() => openDiscountModal(item)}
                          className={`px-3 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 ml-auto ${
                            promo 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                              : 'bg-zinc-800 text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 hover:border-amber-500'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>{promo ? 'Edit Promo' : 'Add Discount'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'events' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-luxury bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 flex-1 shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800/80">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-white">Resort Event Happenings</h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">Active public experiences and weekend masterclasses broadcasted to the landing page.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(event => (
              <div key={event.id} className="card-luxury bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/50 rounded-2xl p-5 flex gap-5 shadow-lg group transition-all">
                <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-zinc-800 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">{event.date}</span>
                    <h3 className="font-heading font-extrabold text-base text-white mt-1.5 group-hover:text-amber-300 transition-colors">{event.title}</h3>
                    <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-luxury bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-8 max-w-2xl shadow-2xl space-y-6">
          <div className="pb-4 border-b border-zinc-800/80">
            <h2 className="text-xl font-heading font-extrabold text-white">Manual Transfer Gateways</h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">Configure bank destination accounts for manual patron verification audits.</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Primary Settlement Account</span>
            </div>
            <div>
              <label className="block text-zinc-400 uppercase font-bold mb-1.5">Bank Institution Name</label>
              <input type="text" className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white font-bold" defaultValue="Bank Central Asia (BCA)" />
            </div>
            <div>
              <label className="block text-zinc-400 uppercase font-bold mb-1.5">Account Number</label>
              <input type="text" className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-amber-400 font-bold text-sm" defaultValue="872-3612-874" />
            </div>
          </div>

          <div className="flex justify-end font-sans">
            <Button variant="luxury" className="px-8 py-5 text-xs font-bold gap-2">
              <Save className="w-4 h-4" />
              <span>Update Settlement Rules</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Set Discount Modal */}
      <AnimatePresence>
        {discountModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-zinc-100 font-mono text-xs"
            >
              <button onClick={() => setDiscountModalItem(null)} className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
              
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Promotional Engine Calibration</span>
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-white mb-1">{discountModalItem.name}</h2>
              <p className="text-zinc-400 mb-6 font-sans">Configure promotional pricing override for this item.</p>

              <div className="space-y-5 mb-8 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-800/80">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Current Standard Price</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-bold text-sm">
                    Rp {discountModalItem.price.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Discount Type</label>
                    <select 
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="input-luxury w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none font-bold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cut (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Discount Value</label>
                    <input 
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? "e.g. 20" : "e.g. 10000"}
                      className="input-luxury w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 italic">Leave value blank or set to 0 to remove existing discount from catalog.</p>
              </div>

              <div className="flex gap-3 font-sans">
                <Button variant="outline" className="flex-1 py-4 font-bold text-xs" onClick={() => setDiscountModalItem(null)}>Dismiss</Button>
                <Button variant="luxury" className="flex-1 py-4 font-bold text-xs gap-1.5" onClick={handleSaveDiscount}>
                  <Tag className="w-3.5 h-3.5" />
                  <span>Deploy Promotion</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
