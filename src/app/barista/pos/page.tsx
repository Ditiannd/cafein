'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, X, CreditCard, Banknote, QrCode, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApiQuery } from '@/lib/hooks';
import { api, CatalogItem } from '@/lib/api';

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

  const getEffectivePrice = (item: CatalogItem) => {
    if (item.discountType && item.discountValue) {
      if (item.discountType === 'percentage') return item.price * (1 - item.discountValue / 100);
      return Math.max(0, item.price - item.discountValue);
    }
    return item.price;
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
      // Group cart items
      const itemMap = new Map<number, { catalogItemId: number; quantity: number; iceLevel?: string; sugarLevel?: string; milkType?: string }>();
      for (const item of activeTab.cart) {
        const key = item.menuItem.id;
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

      const order = await api.orders.create({
        source: 'pos',
        items: Array.from(itemMap.values()),
        paymentMethod: paymentMethod,
        customerName: 'Walk-in',
        orderType: activeTab.orderType === 'Dine In' ? 'dine_in' : 'takeaway',
        tableNumber: activeTab.tableId || undefined,
        amountPaid: paymentMethod === 'cash' && amountPaidInput ? parseInt(amountPaidInput) : undefined,
      });

      const change = paymentMethod === 'cash' && amountPaidInput ? Math.max(0, parseInt(amountPaidInput) - order.totalAmount) : 0;

      const receipt: ReceiptData = {
        id: order.id,
        orderNumber: order.orderNumber,
        orderType: activeTab.orderType,
        tableId: activeTab.tableId,
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
  const subtotal = activeTab.cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const discountTotal = activeTab.cart.reduce((sum, item) => {
    const effective = getEffectivePrice(item.menuItem);
    if (effective < item.menuItem.price) {
      return sum + ((item.menuItem.price - effective) * item.quantity);
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
    <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      
      {/* Left Area: Menu Browser */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/10">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-3">
            {/* Sections */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2">
              <button
                onClick={() => { setActiveSection('All'); setActiveCategory('All Categories'); }}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'All' 
                    ? 'bg-[var(--color-brand-accent)] text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All Sections
              </button>
              <button
                onClick={() => { setActiveSection('Promotions'); setActiveCategory('All Categories'); }}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'Promotions' 
                    ? 'bg-[var(--color-brand-accent)] text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Promotions
              </button>
              {categoriesFromCatalog.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveSection(cat!); setActiveCategory('All Categories'); }}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === cat 
                      ? 'bg-[var(--color-brand-accent)] text-black' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => {
              const effectivePrice = getEffectivePrice(item);
              const hasDiscount = item.discountType && item.discountValue;
              return (
                <div 
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[var(--color-brand-accent)] hover:shadow-[0_0_15px_rgba(200,169,126,0.1)] transition-all group flex flex-col"
                >
                  <div className="h-32 relative bg-white/5 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {hasModifiers(item) && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                        Modifiable
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-white font-medium mb-1 truncate">{item.name}</h3>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-brand-accent)] font-semibold text-sm">Rp {effectivePrice.toLocaleString('id-ID')}</span>
                          <span className="text-gray-500 line-through text-xs">Rp {item.price.toLocaleString('id-ID')}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--color-brand-accent)] font-semibold text-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Area: Cart & Checkout */}
      <div className="w-full md:w-[400px] flex flex-col bg-white/5 shrink-0">
        
        {/* Order Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar bg-background border-b border-white/10 shrink-0">
          {orderTabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 min-w-[120px] cursor-pointer border-r border-white/10 transition-colors group ${
                activeTabId === tab.id ? 'bg-white/5 border-b-2 border-b-[var(--color-brand-accent)]' : 'hover:bg-white/5'
              }`}
            >
              <span className={`text-sm font-medium truncate ${activeTabId === tab.id ? 'text-white' : 'text-gray-400'}`}>
                {tab.name}
              </span>
              <button 
                onClick={(e) => handleCloseTab(tab.id, e)}
                className={`ml-auto p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 ${activeTabId === tab.id ? 'opacity-100 text-gray-300' : 'text-gray-500'}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHistory(true)}
                className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center shrink-0 border-l border-white/10"
                title="Today's History"
              >
                <span className="text-sm font-medium">Today&apos;s History</span>
              </button>
              <button 
                onClick={handleCreateNewTab}
                className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center shrink-0 border-l border-white/10"
                title="New Order Tab"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Order Type & Table Selection */}
        <div className="bg-background border-b border-white/10 p-4 shrink-0 space-y-3">
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
            <button 
              onClick={() => updateOrderMeta({ orderType: 'Dine In' })}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab.orderType === 'Dine In' ? 'bg-[var(--color-brand-accent)] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Dine In
            </button>
            <button 
              onClick={() => updateOrderMeta({ orderType: 'Takeaway', tableId: null })}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab.orderType === 'Takeaway' ? 'bg-[var(--color-brand-accent)] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Takeaway
            </button>
          </div>
          
          {activeTab.orderType === 'Dine In' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 min-w-[60px]">Table:</span>
              <select 
                value={activeTab.tableId || ''}
                onChange={(e) => updateOrderMeta({ tableId: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none appearance-none"
              >
                <option value="" disabled className="bg-zinc-900 text-white">Select a table</option>
                <option value="T1" className="bg-zinc-900 text-white">Table 1 (T1)</option>
                <option value="T2" className="bg-zinc-900 text-white">Table 2 (T2)</option>
                <option value="T3" className="bg-zinc-900 text-white">Table 3 (T3)</option>
                <option value="C1" className="bg-zinc-900 text-white">Couch 1 (C1)</option>
                <option value="B1" className="bg-zinc-900 text-white">Bar 1 (B1)</option>
              </select>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>Order is empty.</p>
              <p className="text-sm">Select items from the menu.</p>
            </div>
          ) : (
            activeTab.cart.map(item => {
              const effectivePrice = getEffectivePrice(item.menuItem);
              return (
                <div key={item.id} className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/10 relative group">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white text-sm font-medium truncate pr-2">{item.menuItem.name}</h4>
                      <span className="text-[var(--color-brand-accent)] text-sm font-semibold shrink-0">
                        Rp {(effectivePrice * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {item.modifiers && (
                      <p className="text-xs text-gray-500 mt-1 leading-tight">
                        {item.modifiers.iceLevel} • {item.modifiers.sugarLevel} • {item.modifiers.milkType}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-between bg-white/5 rounded-lg w-10">
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-full h-8 flex items-center justify-center text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                    <span className="text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-full h-8 flex items-center justify-center text-gray-400 hover:text-white">
                      {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="bg-background border-t border-white/10 p-4 shrink-0 space-y-3">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm text-red-400">
              <span>Discount</span>
              <span>-Rp {discountTotal.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-400">
            <span>Tax (11%)</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-white/5">
            <span>Total</span>
            <span className="text-[var(--color-brand-accent)]">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          
          <Button 
            variant="luxury" 
            className="w-full py-6 text-lg font-semibold mt-4 shadow-[0_0_20px_rgba(200,169,126,0.15)]"
            disabled={activeTab.cart.length === 0 || (activeTab.orderType === 'Dine In' && !activeTab.tableId)}
            onClick={() => setShowCheckout(true)}
          >
            Charge • Rp {total.toLocaleString('id-ID')}
          </Button>
        </div>

      </div>

      {/* --- Modals --- */}

      {/* Modifier Modal */}
      <AnimatePresence>
        {selectedItemForMod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-semibold">{selectedItemForMod.name}</h2>
                  <p className="text-[var(--color-brand-accent)] mt-1">Rp {selectedItemForMod.price.toLocaleString('id-ID')}</p>
                </div>
                <button onClick={() => setSelectedItemForMod(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-gray-400">Ice Level</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Less Ice', 'Normal', 'Extra Ice'].map(level => (
                      <button
                        key={level}
                        onClick={() => setIceLevel(level)}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors border ${iceLevel === level ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)] border-[var(--color-brand-accent)]/50' : 'bg-background border-white/10 text-gray-400 hover:bg-white/5'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-gray-400">Sugar Level</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Less Sugar', 'Normal', 'Extra Sugar'].map(level => (
                      <button
                        key={level}
                        onClick={() => setSugarLevel(level)}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors border ${sugarLevel === level ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)] border-[var(--color-brand-accent)]/50' : 'bg-background border-white/10 text-gray-400 hover:bg-white/5'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-gray-400">Milk Type</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {['Fresh Milk', 'Oat Milk (+10k)', 'Almond Milk (+12k)'].map(milk => (
                      <button
                        key={milk}
                        onClick={() => setMilkType(milk)}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors border text-left ${milkType === milk ? 'bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-accent)] border-[var(--color-brand-accent)]/50' : 'bg-background border-white/10 text-gray-400 hover:bg-white/5'}`}
                      >
                        {milk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10">
                <Button 
                  variant="luxury" 
                  className="w-full py-5"
                  onClick={() => addToCart(selectedItemForMod, { iceLevel, sugarLevel, milkType })}
                >
                  Confirm & Add
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Payment</h2>
                <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-8">
                  <p className="text-gray-400 text-sm mb-1">Total Due</p>
                  <p className="text-4xl font-semibold text-[var(--color-brand-accent)]">Rp {total.toLocaleString('id-ID')}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-colors ${paymentMethod === 'qris' ? 'bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    <QrCode className="w-8 h-8" />
                    <span className="text-sm font-medium">QRIS</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-colors ${paymentMethod === 'card' ? 'bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    <CreditCard className="w-8 h-8" />
                    <span className="text-sm font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-colors ${paymentMethod === 'cash' ? 'bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    <Banknote className="w-8 h-8" />
                    <span className="text-sm font-medium">Cash</span>
                  </button>
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2 font-medium">Amount Received</p>
                    <input 
                      type="number"
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(e.target.value)}
                      placeholder={`Total: Rp ${total.toLocaleString('id-ID')}`}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[var(--color-brand-accent)] focus:outline-none"
                    />
                    {amountPaidInput && parseInt(amountPaidInput) >= total && (
                      <p className="text-xs text-green-400 mt-2">Change: Rp {(parseInt(amountPaidInput) - total).toLocaleString('id-ID')}</p>
                    )}
                  </div>
                )}
                {paymentMethod === 'qris' && (
                  <div className="mb-8 flex flex-col items-center justify-center py-4 bg-white/5 rounded-xl border border-white/10 border-dashed">
                    <QrCode className="w-24 h-24 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">Waiting for customer scan...</p>
                  </div>
                )}

                <Button variant="luxury" className="w-full py-6 text-lg" onClick={handleCheckout}>
                  Complete Payment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-black rounded-lg p-8 max-w-sm w-full shadow-2xl flex flex-col font-mono relative"
            >
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-1">Cafein Today</h2>
                <p className="text-xs text-gray-500">Jl. Siliwangi No. 123, Bandung</p>
                <p className="text-xs text-gray-500">{completedOrder.date}</p>
                <div className="mt-3">
                  <p className="font-bold text-sm uppercase">{completedOrder.orderNumber}</p>
                  <p className="text-sm font-semibold">{completedOrder.orderType} {completedOrder.tableId ? `- Table ${completedOrder.tableId}` : ''}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 min-h-[150px]">
                {completedOrder.cart.map((item: CartItem) => (
                  <div key={item.id} className="mb-3 text-sm">
                    <div className="flex justify-between font-semibold">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <span>{(item.menuItem.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                    {item.modifiers && (
                      <div className="text-xs text-gray-500 ml-5 leading-tight">
                        {item.modifiers.iceLevel}, {item.modifiers.sugarLevel}, {item.modifiers.milkType}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Subtotal</span>
                  <span>Rp {completedOrder.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {completedOrder.discountTotal > 0 && (
                  <div className="flex justify-between mb-1 text-red-500">
                    <span>Discount</span>
                    <span>-Rp {completedOrder.discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between mb-1">
                  <span>Tax (11%)</span>
                  <span>Rp {completedOrder.tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-2">
                  <span>Total</span>
                  <span>Rp {completedOrder.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between mt-4 text-gray-500 text-xs uppercase">
                  <span>Payment Method</span>
                  <span>{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs uppercase mt-1">
                  <span>Amount Paid</span>
                  <span>Rp {completedOrder.amountPaid?.toLocaleString('id-ID')}</span>
                </div>
                {completedOrder.change > 0 && (
                  <div className="flex justify-between text-gray-500 text-xs uppercase mt-1">
                    <span>Change</span>
                    <span>Rp {completedOrder.change?.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-gray-100 text-black border-transparent hover:bg-gray-200">
                  Print Receipt
                </Button>
                <Button className="flex-1 bg-black text-white hover:bg-gray-800" onClick={handleCloseReceipt}>
                  New Order
                </Button>
              </div>
              
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-200 via-white to-gray-200 opacity-50" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-white">Today&apos;s History</h2>
                  <p className="text-sm text-gray-400">POS transactions</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {todayOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No orders processed today yet.</p>
                  </div>
                ) : (
                  todayOrders.map((order) => (
                    <div
                      key={order.id}
                      className="w-full text-left bg-white/5 border border-white/10 p-4 rounded-xl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-white">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'} {order.tableNumber ? `(${order.tableNumber})` : ''}</span>
                        <span className="text-[var(--color-brand-accent)] font-medium">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 bg-white/10 text-xs rounded-md text-gray-300 uppercase">{order.paymentMethod}</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/20 text-xs rounded-md uppercase">{order.status}</span>
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
