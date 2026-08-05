'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, X, CreditCard, Banknote, QrCode, CheckCircle2, Sparkles, Coffee, History, Shield, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApiQuery } from '@/lib/hooks';
import { api, CatalogItem, TableItem } from '@/lib/api';

interface CartItem {
  id: string;
  menuItem: CatalogItem;
  quantity: number;
  modifiers?: {
    iceLevel?: string;
    sugarLevel?: string;
    milkType?: string;
  };
}

interface OrderTab {
  id: string;
  name: string;
  cart: CartItem[];
  orderType: 'Dine In' | 'Takeaway';
  tableId: string | null;
}

interface ReceiptData {
  id: string;
  orderNumber: string;
  orderType: string;
  tableId: string | null;
  cart: CartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  date: string;
}

export default function POSPage() {
  const { data: catalog = [] } = useApiQuery('pos-catalog', () => api.catalog.list());
  const { data: canonicalTables = [] } = useApiQuery<TableItem[]>('canonical-tables', () => api.tables.list());

  // Derive sections and categories from the catalog
  const categoriesFromCatalog = Array.from(new Set(catalog.map(c => c.category).filter(Boolean)));

  const [activeSection, setActiveSection] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Multi-Tab Order Management
  const [orderTabs, setOrderTabs] = useState<OrderTab[]>([{ id: 'tab-1', name: 'Order #1', cart: [], orderType: 'Dine In', tableId: null }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  
  const activeTab = orderTabs.find(t => t.id === activeTabId) || orderTabs[0];

  // Modifiers Modal
  const [selectedItemForMod, setSelectedItemForMod] = useState<CatalogItem | null>(null);
  const [iceLevel, setIceLevel] = useState('Normal');
  const [sugarLevel, setSugarLevel] = useState('Normal');
  const [milkType, setMilkType] = useState('Fresh Milk');

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('qris');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [completedOrder, setCompletedOrder] = useState<ReceiptData | null>(null);

  // Order History State
  const [showHistory, setShowHistory] = useState(false);
  const { data: todayOrders = [], refetch: refetchHistory } = useApiQuery('pos-history', () => api.orders.list({ date: 'today', source: 'pos' }));

  // --- Helpers ---
  const computeModifierUpcharge = (item: CatalogItem, mods?: { iceLevel?: string; sugarLevel?: string; milkType?: string }) => {
    let upcharge = 0;
    if (!item.modifierOptions || !mods) return upcharge;
    if (mods.iceLevel && item.modifierOptions.iceLevels) {
      const mod = item.modifierOptions.iceLevels.find(i => i.name === mods.iceLevel);
      if (mod) upcharge += mod.upcharge;
    }
    if (mods.sugarLevel && item.modifierOptions.sugarLevels) {
      const mod = item.modifierOptions.sugarLevels.find(s => s.name === mods.sugarLevel);
      if (mod) upcharge += mod.upcharge;
    }
    if (mods.milkType && item.modifierOptions.milkTypes) {
      const mod = item.modifierOptions.milkTypes.find(m => m.name === mods.milkType);
      if (mod) upcharge += mod.upcharge;
    }
    return upcharge;
  };

  const getEffectivePrice = (item: CatalogItem, upcharge: number = 0) => {
    const basePrice = item.price + upcharge;
    if (item.discountType && item.discountValue) {
      if (item.discountType === 'percentage') return basePrice * (1 - item.discountValue / 100);
      return Math.max(0, basePrice - item.discountValue);
    }
    return basePrice;
  };

  const getCartItemPrice = (cartItem: CartItem) => {
    const upcharge = computeModifierUpcharge(cartItem.menuItem, cartItem.modifiers);
    return getEffectivePrice(cartItem.menuItem, upcharge);
  };

  const hasModifiers = (item: CatalogItem) => item.category !== 'Pastries';

  // --- Actions ---

  const handleCreateNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newName = `Order #${orderTabs.length + 1}`;
    setOrderTabs([...orderTabs, { id: newId, name: newName, cart: [], orderType: 'Dine In', tableId: null }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (orderTabs.length === 1) {
      setOrderTabs([{ id: 'tab-1', name: 'Order #1', cart: [], orderType: 'Dine In', tableId: null }]);
      setActiveTabId('tab-1');
      return;
    }
    const newTabs = orderTabs.filter(t => t.id !== id);
    setOrderTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleMenuItemClick = (item: CatalogItem) => {
    if (hasModifiers(item)) {
      setSelectedItemForMod(item);
      setIceLevel('Normal');
      setSugarLevel('Normal');
      setMilkType('Fresh Milk');
    } else {
      addToCart(item);
    }
  };

  const addToCart = (menuItem: CatalogItem, modifiers?: { iceLevel?: string; sugarLevel?: string; milkType?: string }) => {
    const newItem: CartItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menuItem,
      quantity: 1,
      modifiers
    };

    setOrderTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, cart: [...tab.cart, newItem] };
      }
      return tab;
    }));
    setSelectedItemForMod(null);
  };

  const updateOrderMeta = (updates: Partial<OrderTab>) => {
    setOrderTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, ...updates } : tab));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setOrderTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        const newCart = tab.cart.map(item => {
          if (item.id === cartItemId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        }).filter(Boolean) as CartItem[];
        return { ...tab, cart: newCart };
      }
      return tab;
    }));
  };

  const handleCheckout = async () => {
    setShowCheckout(false);
    
    try {
      const itemMap = new Map<string, { catalogItemId: number; quantity: number; iceLevel?: string; sugarLevel?: string; milkType?: string }>();
      for (const item of activeTab.cart) {
        const mods = item.modifiers ? `-${item.modifiers.iceLevel}-${item.modifiers.sugarLevel}-${item.modifiers.milkType}` : '';
        const key = `${item.menuItem.id}${mods}`;
        const existing = itemMap.get(key);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          itemMap.set(key, {
            catalogItemId: item.menuItem.id,
            quantity: item.quantity,
            iceLevel: item.modifiers?.iceLevel,
            sugarLevel: item.modifiers?.sugarLevel,
            milkType: item.modifiers?.milkType,
          });
        }
      }

      const selectedTableObj = canonicalTables.find((t: TableItem) => t.id === activeTab.tableId || t.name === activeTab.tableId);

      const order = await api.orders.create({
        source: 'pos',
        items: Array.from(itemMap.values()),
        paymentMethod: paymentMethod,
        customerName: 'Walk-in Patron',
        orderType: activeTab.orderType === 'Dine In' ? 'dine_in' : 'takeaway',
        tableNumber: selectedTableObj ? selectedTableObj.name : activeTab.tableId || undefined,
        tableId: selectedTableObj ? selectedTableObj.id : activeTab.tableId || undefined,
        amountPaid: paymentMethod === 'cash' && amountPaidInput ? parseInt(amountPaidInput) : undefined,
      });

      const change = paymentMethod === 'cash' && amountPaidInput ? Math.max(0, parseInt(amountPaidInput) - order.totalAmount) : 0;

      const receipt: ReceiptData = {
        id: order.id,
        orderNumber: order.orderNumber,
        orderType: activeTab.orderType,
        tableId: selectedTableObj ? selectedTableObj.name : activeTab.tableId,
        cart: activeTab.cart,
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        tax: order.tax,
        total: order.totalAmount,
        paymentMethod,
        amountPaid: paymentMethod === 'cash' && amountPaidInput ? parseInt(amountPaidInput) : order.totalAmount,
        change,
        date: new Date().toLocaleString(),
      };

      setCompletedOrder(receipt);
      refetchHistory();
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  const handleCloseReceipt = () => {
    setCompletedOrder(null);
    setAmountPaidInput('');
    setOrderTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, cart: [], orderType: 'Dine In', tableId: null } : t));
  };

  // Calculations
  const subtotal = activeTab.cart.reduce((sum, item) => sum + ((item.menuItem.price + computeModifierUpcharge(item.menuItem, item.modifiers)) * item.quantity), 0);
  const discountTotal = activeTab.cart.reduce((sum, item) => {
    const upcharge = computeModifierUpcharge(item.menuItem, item.modifiers);
    const base = item.menuItem.price + upcharge;
    const effective = getEffectivePrice(item.menuItem, upcharge);
    if (effective < base) {
      return sum + ((base - effective) * item.quantity);
    }
    return sum;
  }, 0);
  const afterDiscount = subtotal - discountTotal;
  const tax = afterDiscount * 0.11;
  const total = afterDiscount + tax;

  const filteredMenu = catalog.filter(item => {
    if (activeSection === 'Promotions') {
      return item.discountType !== null && item.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    const matchesSection = activeSection === 'All' || item.category === activeSection;
    const matchesCategory = activeCategory === 'All Categories' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesCategory && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden bg-[#141210] font-sans select-none text-[#FFFFFF]">
      
      {/* Left Area: Menu Catalog Browser */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#E5A93C]/20/80 bg-[#141210]">
        
        {/* Header & Search Bar */}
        <div className="p-5 border-b border-[#E5A93C]/20/80 shrink-0 bg-[#141210]/90 backdrop-blur-md">
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#C6C0B4]" />
            <input 
              type="text"
              placeholder="Search artisanal beverages, roasts & pastries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-luxury w-full bg-[#1E1A17] border border-[#E5A93C]/20 focus:border-[#E5A93C] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 shadow-inner"
            />
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2.5 font-mono text-xs">
            <button
              onClick={() => { setActiveSection('All'); setActiveCategory('All Categories'); }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl transition-all font-bold ${
                activeSection === 'All' 
                  ? 'bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                  : 'bg-[#1E1A17]/80 text-[#C6C0B4] hover:bg-[#2B231D] border border-[#E5A93C]/20 hover:text-white'
              }`}
            >
              ● All Catalog
            </button>
            <button
              onClick={() => { setActiveSection('Promotions'); setActiveCategory('All Categories'); }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-1.5 ${
                activeSection === 'Promotions' 
                  ? 'bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                  : 'bg-[#1E1A17]/80 text-[#C6C0B4] hover:bg-[#2B231D] border border-[#E5A93C]/20 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-rose-400" />
              <span>Promotions</span>
            </button>
            {categoriesFromCatalog.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveSection(cat!); setActiveCategory('All Categories'); }}
                className={`whitespace-nowrap px-4 py-2 rounded-xl transition-all font-bold ${
                  activeSection === cat 
                    ? 'bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                    : 'bg-[#1E1A17]/80 text-[#C6C0B4] hover:bg-[#2B231D] border border-[#E5A93C]/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => {
              const effectivePrice = getEffectivePrice(item);
              const hasDiscount = item.discountType && item.discountValue;
              return (
                <div 
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="card-luxury bg-[#1E1A17]/70 border border-[#E5A93C]/20/80 rounded-2xl overflow-hidden cursor-pointer hover:border-[#E5A93C]/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-32 relative bg-[#141210] shrink-0 overflow-hidden border-b border-[#E5A93C]/20/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-60" />
                      
                      {hasModifiers(item) && (
                        <div className="absolute top-2 left-2 bg-[#1E1A17]/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-[#E5A93C] font-mono font-bold border border-[#E5A93C]/30">
                          Modifiable
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-0.5 rounded-md text-[10px] font-mono font-black">
                          {item.discountType === 'percentage' ? `-${item.discountValue}%` : 'PROMO'}
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-white font-heading font-extrabold text-sm mb-1 truncate group-hover:text-[#E5A93C] transition-colors">{item.name}</h3>
                      <p className="text-[10px] font-mono text-[#C6C0B4] uppercase tracking-wider">{item.category}</p>
                    </div>
                  </div>

                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[#E5A93C]/20/60 flex items-center justify-between bg-[#141210]/40">
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-[#E5A93C] font-bold text-xs">Rp {effectivePrice.toLocaleString('id-ID')}</span>
                        <span className="text-zinc-600 line-through text-[10px]">Rp {item.price.toLocaleString('id-ID')}</span>
                      </div>
                    ) : (
                      <span className="text-[#E5A93C] font-mono font-bold text-xs">Rp {item.price.toLocaleString('id-ID')}</span>
                    )}
                    <div className="w-6 h-6 rounded-lg bg-[#1E1A17] border border-[#E5A93C]/30 flex items-center justify-center text-[#C6C0B4] group-hover:bg-[#E5A93C] group-hover:text-zinc-950 group-hover:border-[#E5A93C] transition-all font-bold text-xs">
                      +
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Area: Order Tray & Multi-Tab Checkout */}
      <div className="w-full md:w-[420px] flex flex-col bg-[#141210] shrink-0 border-l border-[#E5A93C]/20/80 z-20">
        
        {/* Order Tabs Header */}
        <div className="flex overflow-x-auto hide-scrollbar bg-[#141210] border-b border-[#E5A93C]/20/80 shrink-0 font-mono text-xs">
          {orderTabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 min-w-[130px] cursor-pointer border-r border-[#E5A93C]/20/80 transition-all group ${
                activeTabId === tab.id 
                  ? 'bg-[#1E1A17] text-[#E5A93C] border-t-2 border-t-amber-500 font-bold shadow-inner' 
                  : 'bg-[#141210] text-[#C6C0B4] hover:text-[#ECE6DD] hover:bg-[#1E1A17]/40'
              }`}
            >
              <span className="truncate flex-1">{tab.name}</span>
              {tab.cart.length > 0 && (
                <span className="bg-[#E5A93C]/20 text-[#E5A93C] px-1.5 py-0.2 rounded text-[10px] font-extrabold">
                  {tab.cart.length}
                </span>
              )}
              <button 
                onClick={(e) => handleCloseTab(tab.id, e)}
                className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/20 hover:text-rose-400 ${
                  activeTabId === tab.id ? 'opacity-100 text-[#C6C0B4]' : 'text-zinc-600'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex shrink-0">
            <button 
              onClick={() => setShowHistory(true)}
              className="px-3 py-3 text-[#C6C0B4] hover:text-[#E5A93C] hover:bg-[#1E1A17]/60 transition-all flex items-center justify-center border-r border-[#E5A93C]/20/80"
              title="Today's Ledger"
            >
              <History className="w-4 h-4" />
            </button>
            <button 
              onClick={handleCreateNewTab}
              className="px-4 py-3 text-[#C6C0B4] hover:text-white hover:bg-[#1E1A17]/60 transition-all flex items-center justify-center bg-[#1E1A17]/30"
              title="New Order Station Tab"
            >
              <Plus className="w-4 h-4 text-[#E5A93C]" />
            </button>
          </div>
        </div>

        {/* Order Type & Canonical Table Selector */}
        <div className="bg-[#1E1A17]/40 border-b border-[#E5A93C]/20/80 p-4 shrink-0 space-y-3 font-mono text-xs">
          <div className="flex gap-2 p-1 bg-[#141210] rounded-xl border border-[#E5A93C]/20">
            <button 
              onClick={() => updateOrderMeta({ orderType: 'Dine In' })}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                activeTab.orderType === 'Dine In' 
                  ? 'bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/40 shadow-sm' 
                  : 'text-[#C6C0B4] hover:text-[#ECE6DD]'
              }`}
            >
              ● Dine In (Table Linked)
            </button>
            <button 
              onClick={() => updateOrderMeta({ orderType: 'Takeaway', tableId: null })}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                activeTab.orderType === 'Takeaway' 
                  ? 'bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/40 shadow-sm' 
                  : 'text-[#C6C0B4] hover:text-[#ECE6DD]'
              }`}
            >
              ○ Takeaway Counter
            </button>
          </div>
          
          {activeTab.orderType === 'Dine In' && (
            <div className="flex items-center gap-2">
              <span className="text-[#C6C0B4] font-bold shrink-0">Table Allocation:</span>
              <select 
                value={activeTab.tableId || ''}
                onChange={(e) => updateOrderMeta({ tableId: e.target.value })}
                className="input-luxury flex-1 bg-[#141210] border border-[#E5A93C]/20 rounded-xl p-2 text-white focus:border-[#E5A93C] focus:outline-none appearance-none font-semibold text-xs"
              >
                <option value="" disabled className="bg-[#141210] text-[#C6C0B4]">Select Canonical Resort Table...</option>
                {canonicalTables.map((t: TableItem) => (
                  <option 
                    key={t.id} 
                    value={t.id} 
                    disabled={t.status === 'out_of_service' || t.status === 'cleaning'} 
                    className="bg-[#141210] text-white"
                  >
                    Table {t.name} ({t.capacity} Pax) — {t.status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cart Tray Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
          {activeTab.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 border border-dashed border-[#E5A93C]/20/60 rounded-2xl p-6">
              <Coffee className="w-10 h-10 text-zinc-700 stroke-[1.5]" />
              <p className="font-semibold text-[#C6C0B4]">Station Tray is Empty</p>
              <p className="text-[11px] text-center text-zinc-600">Select items from the catalog browser to build this order tab.</p>
            </div>
          ) : (
            activeTab.cart.map(item => {
              const effectivePrice = getCartItemPrice(item);
              return (
                <div key={item.id} className="flex gap-3 bg-[#1E1A17]/70 p-3.5 rounded-xl border border-[#E5A93C]/20/80 relative group hover:border-[#E5A93C]/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white font-heading font-extrabold text-sm truncate pr-2">{item.menuItem.name}</h4>
                      <span className="text-[#E5A93C] font-bold text-xs shrink-0">
                        Rp {(effectivePrice * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {item.modifiers && (
                      <p className="text-[11px] text-[#C6C0B4] mt-1 leading-tight">
                        {item.modifiers.iceLevel} • {item.modifiers.sugarLevel} • {item.modifiers.milkType}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#141210] border border-[#E5A93C]/20 rounded-lg p-1 shrink-0">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded bg-[#1E1A17] hover:bg-[#2B231D] flex items-center justify-center text-[#C6C0B4] hover:text-white transition-colors">
                      {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-400" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="w-6 text-center font-bold text-white text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded bg-[#1E1A17] hover:bg-[#2B231D] flex items-center justify-center text-[#C6C0B4] hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals & Charge Button */}
        <div className="bg-[#141210] border-t border-[#E5A93C]/20/80 p-5 shrink-0 space-y-2.5 font-mono text-xs">
          <div className="flex justify-between text-[#C6C0B4]">
            <span>Subtotal Amount</span>
            <span className="text-white font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Promotional Discount</span>
              <span className="font-bold">-Rp {discountTotal.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-[#C6C0B4]">
            <span>Resort Tax (11%)</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-2.5 border-t border-[#E5A93C]/20/80">
            <span className="uppercase tracking-wider">Total Payable</span>
            <span className="text-[#E5A93C] font-extrabold text-lg">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          
          <Button 
            variant="luxury" 
            className="w-full py-6 text-sm font-bold mt-3 gap-2 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
            disabled={activeTab.cart.length === 0 || (activeTab.orderType === 'Dine In' && !activeTab.tableId)}
            onClick={() => setShowCheckout(true)}
          >
            <Sparkles className="w-4 h-4" />
            <span>Charge Station • Rp {total.toLocaleString('id-ID')}</span>
          </Button>
        </div>

      </div>

      {/* --- Modals --- */}

      {/* Modifier Modal */}
      <AnimatePresence>
        {selectedItemForMod && (() => {
          const currentUpcharge = computeModifierUpcharge(selectedItemForMod, { iceLevel, sugarLevel, milkType });
          const currentTotal = selectedItemForMod.price + currentUpcharge;
          
          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-[#1E1A17] border border-[#E5A93C]/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-[#FFFFFF] font-mono text-xs"
            >
              <div className="p-6 border-b border-[#E5A93C]/20/80 flex justify-between items-center bg-[#141210]/80 font-heading font-extrabold text-base text-white">
                <div>
                  <h2>{selectedItemForMod.name}</h2>
                  <p className="text-[#E5A93C] font-mono font-bold text-xs mt-0.5">Rp {currentTotal.toLocaleString('id-ID')}</p>
                </div>
                <button onClick={() => setSelectedItemForMod(null)} className="p-2 rounded-xl bg-[#2B231D]/50 text-[#C6C0B4] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-6 bg-[#141210]/40">
                {selectedItemForMod.modifierOptions?.iceLevels && selectedItemForMod.modifierOptions.iceLevels.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#ECE6DD] uppercase tracking-wider mb-2.5">1. Ice Level Calibration</h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {selectedItemForMod.modifierOptions.iceLevels.map(level => (
                        <button
                          key={level.name}
                          onClick={() => setIceLevel(level.name)}
                          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                            iceLevel === level.name 
                              ? 'bg-[#E5A93C]/20 text-[#E5A93C] border-[#E5A93C]/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                              : 'bg-[#1E1A17] border-[#E5A93C]/20 text-[#C6C0B4] hover:border-[#E5A93C]/30'
                          }`}
                        >
                          {level.name} {level.upcharge > 0 ? `(+${level.upcharge / 1000}k)` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItemForMod.modifierOptions?.sugarLevels && selectedItemForMod.modifierOptions.sugarLevels.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#ECE6DD] uppercase tracking-wider mb-2.5">2. Sugar Level Calibration</h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {selectedItemForMod.modifierOptions.sugarLevels.map(level => (
                        <button
                          key={level.name}
                          onClick={() => setSugarLevel(level.name)}
                          className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                            sugarLevel === level.name 
                              ? 'bg-[#E5A93C]/20 text-[#E5A93C] border-[#E5A93C]/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                              : 'bg-[#1E1A17] border-[#E5A93C]/20 text-[#C6C0B4] hover:border-[#E5A93C]/30'
                          }`}
                        >
                          {level.name} {level.upcharge > 0 ? `(+${level.upcharge / 1000}k)` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItemForMod.modifierOptions?.milkTypes && selectedItemForMod.modifierOptions.milkTypes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#ECE6DD] uppercase tracking-wider mb-2.5">3. Artisanal Dairy Option</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedItemForMod.modifierOptions.milkTypes.map(milk => (
                        <button
                          key={milk.name}
                          onClick={() => setMilkType(milk.name)}
                          className={`py-3.5 px-4 rounded-xl text-xs font-bold transition-all border text-left flex justify-between ${
                            milkType === milk.name 
                              ? 'bg-[#E5A93C]/20 text-[#E5A93C] border-[#E5A93C]/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                              : 'bg-[#1E1A17] border-[#E5A93C]/20 text-[#C6C0B4] hover:border-[#E5A93C]/30'
                          }`}
                        >
                          <span>{milk.name}</span>
                          {milk.upcharge > 0 && <span className="text-[#E5A93C]">(+{milk.upcharge / 1000}k)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#141210] border-t border-[#E5A93C]/20/80 font-sans">
                <Button 
                  variant="luxury" 
                  className="w-full py-5 text-sm font-bold gap-2"
                  onClick={() => addToCart(selectedItemForMod, { iceLevel, sugarLevel, milkType })}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Confirm & Add for Rp {currentTotal.toLocaleString('id-ID')}</span>
                </Button>
              </div>
            </motion.div>
          </div>
          );
        })()}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-[#1E1A17] border border-[#E5A93C]/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-[#FFFFFF] font-mono text-xs"
            >
              <div className="p-6 border-b border-[#E5A93C]/20/80 flex justify-between items-center bg-[#141210]/80 font-heading font-extrabold text-lg text-white">
                <span>Station Payment Gateway</span>
                <button onClick={() => setShowCheckout(false)} className="p-2 rounded-xl bg-[#2B231D]/50 text-[#C6C0B4] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-6 bg-[#141210]/40">
                <div className="text-center p-6 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <p className="text-[#C6C0B4] uppercase tracking-widest font-bold mb-1">Total Amount Payable</p>
                  <p className="text-4xl font-extrabold text-[#E5A93C]">Rp {total.toLocaleString('id-ID')}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all font-bold ${
                      paymentMethod === 'qris' 
                        ? 'bg-[#E5A93C]/20 border-[#E5A93C]/60 text-[#E5A93C] shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-[#1E1A17] border-[#E5A93C]/20 text-[#C6C0B4] hover:border-[#E5A93C]/30'
                    }`}
                  >
                    <QrCode className="w-7 h-7" />
                    <span>QRIS Scan</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all font-bold ${
                      paymentMethod === 'card' 
                        ? 'bg-[#E5A93C]/20 border-[#E5A93C]/60 text-[#E5A93C] shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-[#1E1A17] border-[#E5A93C]/20 text-[#C6C0B4] hover:border-[#E5A93C]/30'
                    }`}
                  >
                    <CreditCard className="w-7 h-7" />
                    <span>Card / EDC</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all font-bold ${
                      paymentMethod === 'cash' 
                        ? 'bg-[#E5A93C]/20 border-[#E5A93C]/60 text-[#E5A93C] shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-[#1E1A17] border-[#E5A93C]/20 text-[#C6C0B4] hover:border-[#E5A93C]/30'
                    }`}
                  >
                    <Banknote className="w-7 h-7" />
                    <span>Cash Settlement</span>
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="space-y-2 bg-[#1E1A17] p-4 rounded-2xl border border-[#E5A93C]/20">
                    <label className="block text-[#ECE6DD] font-bold uppercase tracking-wider">Amount Received from Patron</label>
                    <input 
                      type="number"
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(e.target.value)}
                      placeholder={`Enter amount (Min: Rp ${total.toLocaleString('id-ID')})`}
                      className="input-luxury w-full bg-[#141210] border border-[#E5A93C]/30 focus:border-[#E5A93C] rounded-xl p-3 text-white font-mono text-sm"
                    />
                    {amountPaidInput && parseInt(amountPaidInput) >= total && (
                      <div className="pt-2 flex justify-between text-emerald-400 font-bold text-sm">
                        <span>Change Due:</span>
                        <span>Rp {(parseInt(amountPaidInput) - total).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                )}
                {paymentMethod === 'qris' && (
                  <div className="flex flex-col items-center justify-center py-6 bg-[#1E1A17]/80 rounded-2xl border border-[#E5A93C]/20 border-dashed space-y-2">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <QrCode className="w-24 h-24 text-zinc-950" />
                    </div>
                    <p className="text-[#C6C0B4] font-bold">Waiting for QRIS scan confirmation...</p>
                    <p className="text-[10px] text-zinc-600">Dynamic QR generated by Cafein Today Gateway</p>
                  </div>
                )}

                <div className="pt-2 font-sans">
                  <Button variant="luxury" className="w-full py-6 text-sm font-bold gap-2" onClick={handleCheckout}>
                    <Shield className="w-4 h-4" />
                    <span>Authorize Station Transaction</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-[#141210] text-[#FFFFFF] rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col relative border border-[#E5A93C]/20 text-xs"
            >
              <div className="text-center border-b border-dashed border-[#E5A93C]/20 pb-5 mb-5 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/30 font-bold text-[10px] mb-2">
                  <Coffee className="w-3 h-3" />
                  <span>Official Resort Ledger</span>
                </div>
                <h2 className="text-lg font-heading font-extrabold uppercase tracking-widest text-white">Cafein Today</h2>
                <p className="text-[#C6C0B4] text-[10px]">Jl. Siliwangi No. 123, Bandung • Sanctuary v2</p>
                <p className="text-[#C6C0B4] text-[10px]">{completedOrder.date}</p>
                <div className="pt-2 mt-2 border-t border-zinc-900 flex justify-between font-bold text-[#E5A93C]">
                  <span>{completedOrder.orderNumber}</span>
                  <span>{completedOrder.orderType} {completedOrder.tableId ? `(T-${completedOrder.tableId})` : ''}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-5 min-h-[140px] space-y-3 custom-scrollbar">
                {completedOrder.cart.map((item: CartItem) => (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-white">
                      <span className="truncate pr-2">{item.quantity}x {item.menuItem.name}</span>
                      <span className="text-[#E5A93C] shrink-0">Rp {(getCartItemPrice(item) * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                    {item.modifiers && (
                      <div className="text-[10px] text-[#C6C0B4] ml-4 leading-tight">
                        {item.modifiers.iceLevel}, {item.modifiers.sugarLevel}, {item.modifiers.milkType}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-[#E5A93C]/20 pt-4 mb-6 space-y-1.5 text-[#C6C0B4]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {completedOrder.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {completedOrder.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-400 font-bold">
                    <span>Discount Allocation</span>
                    <span>-Rp {completedOrder.discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Resort Tax (11%)</span>
                  <span>Rp {completedOrder.tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-2 mt-1 border-t border-zinc-900 text-white">
                  <span>Total Settled</span>
                  <span className="text-[#E5A93C]">Rp {completedOrder.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-3 text-[10px] uppercase text-[#C6C0B4]">
                  <span>Payment Gateway</span>
                  <span className="text-[#ECE6DD] font-bold">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase text-[#C6C0B4]">
                  <span>Amount Received</span>
                  <span className="text-[#ECE6DD]">Rp {completedOrder.amountPaid?.toLocaleString('id-ID')}</span>
                </div>
                {completedOrder.change > 0 && (
                  <div className="flex justify-between text-[10px] uppercase text-emerald-400 font-bold">
                    <span>Change Returned</span>
                    <span>Rp {completedOrder.change?.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 font-sans">
                <Button variant="outline" className="flex-1 py-4 font-bold text-xs" onClick={() => window.print()}>
                  Print Ledger
                </Button>
                <Button variant="luxury" className="flex-1 py-4 font-bold text-xs gap-1.5" onClick={handleCloseReceipt}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next Order</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order History Slide-over */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#141210] border-l border-[#E5A93C]/20 z-50 flex flex-col shadow-2xl text-[#FFFFFF] font-mono text-xs"
            >
              <div className="p-6 border-b border-[#E5A93C]/20/80 flex justify-between items-center bg-[#1E1A17]/80">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#E5A93C]" />
                    <h2 className="text-lg font-heading font-extrabold text-white">Today&apos;s POS Ledger</h2>
                  </div>
                  <p className="text-[10px] text-[#C6C0B4] uppercase tracking-widest mt-0.5">Station Transaction History</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 text-[#C6C0B4] hover:text-white bg-[#2B231D]/50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-[#141210]/40">
                {todayOrders.length === 0 ? (
                  <div className="text-center py-20 text-zinc-600 space-y-2 border border-dashed border-[#E5A93C]/20 rounded-2xl p-6">
                    <Coffee className="w-10 h-10 text-zinc-700 mx-auto stroke-[1.5]" />
                    <p className="font-semibold text-[#C6C0B4]">No transactions recorded today</p>
                  </div>
                ) : (
                  todayOrders.map((order) => (
                    <div
                      key={order.id}
                      className="card-luxury bg-[#1E1A17]/70 border border-[#E5A93C]/20/80 p-4 rounded-2xl space-y-2 hover:border-[#E5A93C]/30 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white text-sm">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] text-[#C6C0B4]">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#C6C0B4] font-bold">{order.orderType === 'dine_in' ? 'Dine In' : 'TakeawayCounter'} {order.tableNumber ? `(T-${order.tableNumber})` : ''}</span>
                        <span className="text-[#E5A93C] font-extrabold text-sm">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="pt-2 border-t border-[#E5A93C]/20/60 flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-[#141210] text-[10px] rounded border border-[#E5A93C]/20 text-[#C6C0B4] uppercase font-bold">{order.paymentMethod}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] rounded uppercase font-bold">● {order.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
