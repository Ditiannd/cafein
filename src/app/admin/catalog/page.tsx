'use client';

import React, { useState } from 'react';
import { Search, X, Settings, List, Save, Calendar, Tag, Sparkles, Coffee, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api, CatalogItem, EventItem } from '@/lib/api';

export default function CatalogManagerPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'events' | 'settings'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: catalog = [], refetch: refetchCatalog } = useApiQuery('catalog', () => api.catalog.list());
  const { data: events = [] } = useApiQuery('events', () => api.events.listPublic());
  const { data: storeStatus, refetch: refetchStoreStatus } = useApiQuery('store_status', () => api.store.getStatus());

  // Settings / Payment Rules State
  const [bankName, setBankName] = useState('Bank Central Asia (BCA)');
  const [accountNumber, setAccountNumber] = useState('872-3612-874');
  const [qrisUrl, setQrisUrl] = useState('');

  React.useEffect(() => {
    if (storeStatus?.paymentRules) {
      if (storeStatus.paymentRules.bankName) setBankName(storeStatus.paymentRules.bankName);
      if (storeStatus.paymentRules.accountNumber) setAccountNumber(storeStatus.paymentRules.accountNumber);
      if (storeStatus.paymentRules.qrisUrl !== undefined) setQrisUrl(storeStatus.paymentRules.qrisUrl);
    }
  }, [storeStatus]);

  const handleSavePaymentRules = async () => {
    try {
      await api.store.setStatus({
        paymentRules: { bankName, accountNumber, qrisUrl }
      });
      alert('Payment rules updated successfully!');
      refetchStoreStatus();
    } catch (err) {
      console.error(err);
      alert('Failed to update payment rules');
    }
  };

  // Catalog Item Management State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogModalItem, setCatalogModalItem] = useState<Partial<CatalogItem>>({});

  const openCatalogModal = (item?: CatalogItem) => {
    if (item) {
      setCatalogModalItem(item);
    } else {
      setCatalogModalItem({ name: '', price: 0, categoryId: 1, image: '', badge: '', isBestSeller: false, isAvailable: true });
    }
    setIsCatalogModalOpen(true);
  };

  const handleSaveCatalogItem = async () => {
    try {
      if (catalogModalItem.id) {
        await api.catalog.update(catalogModalItem.id, catalogModalItem);
      } else {
        await api.catalog.create(catalogModalItem);
      }
      refetchCatalog();
      setIsCatalogModalOpen(false);
    } catch (err) {
      console.error('Failed to save catalog item:', err);
      alert('Failed to save item');
    }
  };

  const handleDeleteCatalogItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.catalog.delete(id);
      refetchCatalog();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item');
    }
  };

  // Event Management State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalItem, setEventModalItem] = useState<Partial<EventItem>>({});

  const openEventModal = (item?: EventItem) => {
    if (item) {
      setEventModalItem(item);
    } else {
      setEventModalItem({ title: '', date: '', description: '', image: '', isVisible: true });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    try {
      if (eventModalItem.id) {
        await api.events.update(eventModalItem.id, eventModalItem);
      } else {
        await api.events.create(eventModalItem);
      }
      refetchEvents();
      setIsEventModalOpen(false);
    } catch (err) {
      console.error('Failed to save event:', err);
      alert('Failed to save event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.events.delete(id);
      refetchEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
    }
  };

  const refetchEvents = () => {
    // A trick to refetch since we didn't extract refetch from useApiQuery for events
    window.location.reload();
  };

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
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 text-xs font-mono font-bold">Total Items: {catalog.length}</span>
              <Button variant="luxury" className="text-xs font-bold py-2" onClick={() => openCatalogModal()}>+ Add Menu Item</Button>
            </div>
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
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openCatalogModal(item)} className="px-3 py-1.5 rounded-xl transition-all font-bold text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Edit</button>
                          <button onClick={() => handleDeleteCatalogItem(item.id)} className="px-3 py-1.5 rounded-xl transition-all font-bold text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">Del</button>
                          <button 
                            onClick={() => openDiscountModal(item)}
                            className={`px-3 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 ${
                              promo 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                                : 'bg-zinc-800 text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 hover:border-amber-500'
                            }`}
                          >
                            <Tag className="w-3.5 h-3.5" />
                            <span>{promo ? 'Edit Promo' : 'Add Discount'}</span>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-luxury bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 flex-1 shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800/80">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-white">Resort Event Happenings</h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">Active public experiences and weekend masterclasses broadcasted to the landing page.</p>
            </div>
            <Button variant="luxury" className="text-xs font-bold py-2" onClick={() => openEventModal()}>+ Add Event</Button>
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
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => openEventModal(event)} className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-800 text-zinc-300 hover:text-white">Edit</button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">Delete</button>
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
              <input type="text" className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white font-bold" value={bankName} onChange={e => setBankName(e.target.value)} />
            </div>
            <div>
              <label className="block text-zinc-400 uppercase font-bold mb-1.5">Account Number</label>
              <input type="text" className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-amber-400 font-bold text-sm" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
            </div>
            <div className="mt-6 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider mb-4">
                <Shield className="w-4 h-4" />
                <span>QRIS Configuration</span>
              </div>
              <label className="block text-zinc-400 uppercase font-bold mb-1.5">QRIS Image URL</label>
              <input type="text" className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-sky-500 rounded-xl p-3 text-white font-bold" value={qrisUrl} onChange={e => setQrisUrl(e.target.value)} placeholder="https://example.com/qris.png" />
            </div>
          </div>

          <div className="flex justify-end font-sans">
            <Button variant="luxury" className="px-8 py-5 text-xs font-bold gap-2" onClick={handleSavePaymentRules}>
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

      {/* Catalog Item Modal */}
      <AnimatePresence>
        {isCatalogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative text-zinc-100"
            >
              <button onClick={() => setIsCatalogModalOpen(false)} className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-heading font-extrabold text-white mb-6">{catalogModalItem.id ? 'Edit Menu Item' : 'Add Menu Item'}</h2>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Name</label>
                  <input type="text" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" value={catalogModalItem.name || ''} onChange={e => setCatalogModalItem({...catalogModalItem, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase font-bold mb-1.5">Price</label>
                    <input type="number" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-amber-400" value={catalogModalItem.price || ''} onChange={e => setCatalogModalItem({...catalogModalItem, price: parseInt(e.target.value) || 0})} />
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase font-bold mb-1.5">Category ID</label>
                    <input type="number" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" value={catalogModalItem.categoryId || ''} onChange={e => setCatalogModalItem({...catalogModalItem, categoryId: parseInt(e.target.value) || 1})} />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Image URL</label>
                  <input type="text" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" value={catalogModalItem.image || ''} onChange={e => setCatalogModalItem({...catalogModalItem, image: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase font-bold mb-1.5">Badge</label>
                    <input type="text" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" value={catalogModalItem.badge || ''} onChange={e => setCatalogModalItem({...catalogModalItem, badge: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900" checked={catalogModalItem.isBestSeller || false} onChange={e => setCatalogModalItem({...catalogModalItem, isBestSeller: e.target.checked})} />
                      <span className="text-zinc-300 font-bold">Best Seller</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 font-sans">
                <Button variant="outline" className="flex-1 py-4 font-bold text-xs" onClick={() => setIsCatalogModalOpen(false)}>Cancel</Button>
                <Button variant="luxury" className="flex-1 py-4 font-bold text-xs gap-1.5" onClick={handleSaveCatalogItem}>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Item</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative text-zinc-100"
            >
              <button onClick={() => setIsEventModalOpen(false)} className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-heading font-extrabold text-white mb-6">{eventModalItem.id ? 'Edit Event' : 'Add Event'}</h2>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Title</label>
                  <input type="text" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" value={eventModalItem.title || ''} onChange={e => setEventModalItem({...eventModalItem, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Date (e.g. This Weekend)</label>
                  <input type="text" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" value={eventModalItem.date || ''} onChange={e => setEventModalItem({...eventModalItem, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Description</label>
                  <textarea rows={3} className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white resize-none" value={eventModalItem.description || ''} onChange={e => setEventModalItem({...eventModalItem, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Image URL</label>
                  <input type="text" className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" value={eventModalItem.image || ''} onChange={e => setEventModalItem({...eventModalItem, image: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 mt-8 font-sans">
                <Button variant="outline" className="flex-1 py-4 font-bold text-xs" onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
                <Button variant="luxury" className="flex-1 py-4 font-bold text-xs gap-1.5" onClick={handleSaveEvent}>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Event</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
