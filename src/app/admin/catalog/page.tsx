'use client';

import React, { useState } from 'react';
import { Search, X, Settings, List, Save, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api, CatalogItem } from '@/lib/api';

export default function CatalogManagerPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'events' | 'settings'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: catalog = [], refetch: refetchCatalog } = useApiQuery('catalog', () => api.catalog.list());
  const { data: events = [], refetch: refetchEvents } = useApiQuery('events', () => api.events.listPublic());

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
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-white mb-2">Content Manager</h1>
          <p className="text-gray-400">Manage your menu, events, and promotions.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'catalog' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
          <List className="w-4 h-4" /> Menu Catalog
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'events' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
          <Calendar className="w-4 h-4" /> Events
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
          <Settings className="w-4 h-4" /> Payment Settings
        </button>
      </div>

      {activeTab === 'catalog' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-sm">
                  <th className="py-4 px-4 font-medium uppercase tracking-wider">Product</th>
                  <th className="py-4 px-4 font-medium uppercase tracking-wider">Category</th>
                  <th className="py-4 px-4 font-medium uppercase tracking-wider">Price</th>
                  <th className="py-4 px-4 font-medium uppercase tracking-wider">Badge</th>
                  <th className="py-4 px-4 font-medium uppercase tracking-wider">Best Seller</th>
                  <th className="py-4 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {catalog.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
                  const promo = getPromoDetails(item);
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden shrink-0 border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-medium text-gray-200">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{item.category}</td>
                      <td className="py-4 px-4">
                        {promo ? (
                          <div className="flex flex-col">
                            <span className="text-white font-medium">Rp {promo.finalPrice.toLocaleString('id-ID')}</span>
                            <span className="line-through text-xs text-[var(--color-brand-accent)]">Rp {item.price.toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--color-brand-accent)] font-medium">Rp {item.price.toLocaleString('id-ID')}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {item.badge && item.badge !== '-' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] border border-[var(--color-brand-accent)]/20">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.isBestSeller ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-500'}`}>
                          {item.isBestSeller ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openDiscountModal(item)}
                            className={`p-2 rounded-lg transition-colors ${promo ? 'text-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10' : 'text-gray-400 hover:text-[var(--color-brand-accent)] bg-white/5 hover:bg-white/10'}`}
                            title="Manage Discount"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                        </div>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Events Management</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-background border border-white/10 rounded-xl p-4 flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-[var(--color-brand-accent)] text-sm">{event.date}</p>
                  <p className="text-gray-400 text-xs mt-2 line-clamp-2">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6">Payment Instructions (Manual Transfer)</h2>
          <div className="space-y-6">
            <div className="bg-background border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="font-medium text-[var(--color-brand-accent)]">Bank Transfer Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bank Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none" defaultValue="BCA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Account Number</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none" defaultValue="8723612874" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2 bg-[var(--color-brand-accent)] text-black hover:bg-white border-transparent">
                <Save className="w-4 h-4" /> Save Settings
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Set Discount Modal */}
      <AnimatePresence>
        {discountModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-background border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setDiscountModalItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              
              <h2 className="text-xl font-heading font-semibold text-white mb-1">Set Discount</h2>
              <p className="text-sm text-gray-400 mb-6">Promote {discountModalItem.name}</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Original Price</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm line-through opacity-50">
                    Rp {discountModalItem.price.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Type</label>
                    <select 
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[var(--color-brand-accent)] focus:outline-none appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Value</label>
                    <input 
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? "e.g. 20" : "e.g. 10000"}
                      className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[var(--color-brand-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Leave value blank or 0 to remove discount.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDiscountModalItem(null)}>Cancel</Button>
                <Button variant="default" className="flex-1 bg-[var(--color-brand-accent)] text-black" onClick={handleSaveDiscount}>Apply Discount</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
