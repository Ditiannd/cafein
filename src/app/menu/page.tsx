'use client';

import React, { useState, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Plus, ShoppingBag, X, CheckCircle2, Upload, Star, Sparkles, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import { api, CatalogItem } from '@/lib/api';

interface CartItem extends CatalogItem {
  modifiers: {
    iceLevel: string;
    sugarLevel: string;
    milkType: string;
  };
}

function MenuContent() {
  const { data: catalog = [] } = useApiQuery('catalog', () => api.catalog.list());
  const categories = Array.from(new Set(catalog.map(c => c.category).filter(Boolean)));

  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Signature');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const table = searchParams.get('table');
  const tableId = searchParams.get('tableId');

  // Modifiers state
  const [iceLevel, setIceLevel] = useState('Normal');
  const [sugarLevel, setSugarLevel] = useState('Normal');
  const [milkType, setMilkType] = useState('Fresh Milk');

  const [showPaymentUpload, setShowPaymentUpload] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'qris'>('bank_transfer');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');

  // Update active category when catalog loads
  React.useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0] || 'All Categories');
    }
  }, [categories, activeCategory]);

  const handleAddToCart = () => {
    if (!selectedItem) return;
    setCart([...cart, { ...selectedItem, modifiers: { iceLevel, sugarLevel, milkType } }]);
    setSelectedItem(null);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setPaymentMethod('bank_transfer');
    setUploadError('');
    setShowPaymentUpload(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        handlePaymentUpload(base64Url);
      };
      reader.onerror = () => {
        setUploadError('Failed to read image.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('Failed to process image.');
      setUploading(false);
    }
  };

  const handlePaymentUpload = async (paymentProofUrl: string) => {
    try {
      const itemMap = new Map<number, { catalogItemId: number; quantity: number; iceLevel?: string; sugarLevel?: string; milkType?: string }>();
      for (const item of cart) {
        const existing = itemMap.get(item.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          itemMap.set(item.id, {
            catalogItemId: item.id,
            quantity: 1,
            iceLevel: item.modifiers.iceLevel,
            sugarLevel: item.modifiers.sugarLevel,
            milkType: item.modifiers.milkType,
          });
        }
      }

      const order = await api.orders.create({
        source: 'online',
        items: Array.from(itemMap.values()),
        customerName: 'Online Resort Guest',
        orderType: 'dine_in',
        tableNumber: table || undefined,
        tableId: tableId || undefined,
        paymentMethod: paymentMethod,
        paymentProofUrl: paymentProofUrl,
      });

      setCurrentOrderId(order.id);
      setShowPaymentUpload(false);
      setUploading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowReviewPrompt(true);
      }, 2500);
    } catch (err) {
      console.error('Order failed:', err);
      setUploading(false);
      setUploadError('Order creation failed. Please try again.');
    }
  };

  const handleSubmitReview = async () => {
    try {
      await api.reviews.create({
        author: reviewAuthor || 'Anonymous Patron',
        rating: reviewRating,
        comment: reviewComment,
        orderId: currentOrderId || undefined,
      });
    } catch (err) {
      console.error('Review submission failed:', err);
    }
    finishFlow();
  };

  const finishFlow = () => {
    setCart([]);
    setShowReviewPrompt(false);
    setCurrentOrderId(null);
    router.push('/');
  };

  const getItemPrice = (item: CatalogItem) => {
    if (item.discountType && item.discountValue) {
      if (item.discountType === 'percentage') {
        return item.price * (1 - item.discountValue / 100);
      }
      return Math.max(0, item.price - item.discountValue);
    }
    return item.price;
  };

  const cartTotal = cart.reduce((sum, item) => sum + getItemPrice(item), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 font-sans select-none relative overflow-x-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#27272a_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

      {/* Header */}
      <header className="bg-zinc-950/85 backdrop-blur-2xl border-b border-zinc-800/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-amber-500/50 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-heading font-extrabold text-lg uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Cafein Today</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Resort Menu Ecosystem</span>
                  {(table || tableId) && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase border border-amber-500/40">
                      Table {table || tableId}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-200 hover:text-white transition-all flex items-center gap-2.5 font-mono text-xs font-bold"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Your Order Tray</span>
            {cart.length > 0 ? (
              <span className="w-5 h-5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs flex items-center justify-center rounded-full font-black shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">
                {cart.length}
              </span>
            ) : (
              <span className="text-zinc-600">0</span>
            )}
          </button>
        </div>
        
        {/* Categories Navigation Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex overflow-x-auto hide-scrollbar gap-8 py-3.5 border-t border-zinc-900 font-mono text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat!)}
              className={`whitespace-nowrap uppercase tracking-widest transition-all pb-1 border-b-2 font-bold ${
                activeCategory === cat 
                  ? 'border-amber-500 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.filter(item => item.category === activeCategory).map(item => {
            const finalPrice = getItemPrice(item);
            const hasDiscount = item.discountType && item.discountValue;
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="card-luxury bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/50 overflow-hidden transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-zinc-950 border-b border-zinc-800/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {item.badge && item.badge !== '-' && (
                      <div className="absolute top-3 left-3 bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 border border-amber-500/40 shadow-md">
                        {item.badge}
                      </div>
                    )}
                    {hasDiscount && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1">
                        <Tag className="w-3 h-3 fill-zinc-950" />
                        <span>{item.discountType === 'percentage' ? `-${item.discountValue}%` : `-Rp ${(item.discountValue!/1000).toFixed(0)}k`}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-extrabold text-lg text-white group-hover:text-amber-400 transition-colors mb-1">{item.name}</h3>
                    <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase mb-4">{item.category}</p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-zinc-800/80 flex justify-between items-center bg-zinc-950/40">
                  <div>
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-amber-400 font-mono font-extrabold text-lg">Rp {finalPrice.toLocaleString('id-ID')}</span>
                        <span className="text-zinc-500 line-through font-mono text-xs">Rp {item.price.toLocaleString('id-ID')}</span>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-mono font-extrabold text-lg">Rp {item.price.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                  <button className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:bg-amber-500 group-hover:text-zinc-950 group-hover:border-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold">
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Complex Modifier Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-zinc-900 border-t border-zinc-800 text-zinc-100 rounded-t-3xl z-50 overflow-hidden flex flex-col h-[88vh] shadow-2xl font-sans"
            >
              <div className="relative h-56 bg-zinc-950 shrink-0 border-b border-zinc-800/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">{selectedItem.category}</span>
                    <h2 className="font-heading text-2xl font-extrabold text-white mt-1.5">{selectedItem.name}</h2>
                  </div>
                  <span className="text-amber-400 font-mono font-black text-2xl drop-shadow-md">Rp {getItemPrice(selectedItem).toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 bg-zinc-950/40 font-mono text-xs">
                {selectedItem.category !== 'Pastries' ? (
                  <>
                    {/* Ice Level */}
                    <div className="space-y-2.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">1. Calibration • Ice Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Less Ice', 'Normal', 'Extra Ice'].map(level => (
                          <button
                            key={level}
                            onClick={() => setIceLevel(level)}
                            className={`py-3 px-3 rounded-xl transition-all border font-semibold ${
                              iceLevel === level 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sugar Level */}
                    <div className="space-y-2.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">2. Calibration • Sugar Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Less Sugar', 'Normal', 'Extra Sugar'].map(level => (
                          <button
                            key={level}
                            onClick={() => setSugarLevel(level)}
                            className={`py-3 px-3 rounded-xl transition-all border font-semibold ${
                              sugarLevel === level 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Milk Option */}
                    <div className="space-y-2.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">3. Artisanal Dairy • Milk Option</label>
                      <div className="space-y-2">
                        {['Fresh Milk', 'Oat Milk (+10k)', 'Almond Milk (+12k)'].map(milk => (
                          <button
                            key={milk}
                            onClick={() => setMilkType(milk)}
                            className={`w-full py-3.5 px-4 text-left rounded-xl transition-all border flex justify-between items-center font-semibold ${
                              milkType === milk 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <span>{milk.split(' (')[0]}</span>
                            {milk.includes('(') && <span className="text-amber-400/80 font-bold">{milk.split(' ')[2]}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-center font-mono">
                    Pastries are served fresh daily at room temperature or lightly warmed by our barista upon service.
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-zinc-800/80 bg-zinc-950/80 shrink-0">
                <Button variant="luxury" className="w-full py-5 text-sm gap-2" onClick={handleAddToCart}>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Confirm Selection • Rp {getItemPrice(selectedItem).toLocaleString('id-ID')}</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 text-zinc-100 z-50 flex flex-col shadow-2xl font-sans"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/60">
                <div className="flex items-center gap-2.5 font-heading font-extrabold text-lg text-white">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <span>Your Order Tray</span>
                  <span className="text-xs font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{cart.length}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950/30 font-mono">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 text-zinc-500 space-y-3">
                    <Coffee className="w-12 h-12 text-zinc-700 stroke-[1.5]" />
                    <p className="text-sm font-semibold">Your order tray is currently empty</p>
                    <p className="text-xs max-w-xs text-zinc-600">Select signature beverages or pastries from our resort menu to begin.</p>
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl relative group">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-bold text-sm text-white truncate">{item.name}</h4>
                          <span className="font-mono font-bold text-amber-400 text-sm shrink-0">Rp {getItemPrice(item).toLocaleString('id-ID')}</span>
                        </div>
                        {item.category !== 'Pastries' && (
                          <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider">
                            {item.modifiers.iceLevel} • {item.modifiers.sugarLevel} • {item.modifiers.milkType}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-2">
                          <span>Qty: 1</span>
                          <span className="text-emerald-400">● Live Table Linked</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-800/80 bg-zinc-950/90 space-y-4 font-mono">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 uppercase tracking-wider">Subtotal Amount</span>
                    <span className="text-amber-400 font-extrabold text-xl">Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <Button variant="luxury" className="w-full py-5 text-sm gap-2" onClick={handleCheckout}>
                    <Sparkles className="w-4 h-4" />
                    <span>Proceed to Secure Transfer</span>
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Upload Modal */}
      <AnimatePresence>
        {showPaymentUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-zinc-100"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/60 font-heading font-extrabold text-lg text-white">
                <span>Secure Checkout</span>
                <button onClick={() => setShowPaymentUpload(false)} className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex bg-zinc-950 border-b border-zinc-800">
                <button 
                  onClick={() => setPaymentMethod('bank_transfer')} 
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${paymentMethod === 'bank_transfer' ? 'text-amber-400 border-b-2 border-amber-400 bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Bank Transfer
                </button>
                <button 
                  onClick={() => setPaymentMethod('qris')} 
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${paymentMethod === 'qris' ? 'text-amber-400 border-b-2 border-amber-400 bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  QRIS
                </button>
              </div>

              <div className="p-6 space-y-6 font-mono text-xs max-h-[70vh] overflow-y-auto">
                <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl text-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <p className="text-zinc-400 uppercase tracking-widest mb-1 font-bold">Total Amount Due</p>
                  <p className="text-3xl font-extrabold text-amber-400">Rp {cartTotal.toLocaleString('id-ID')}</p>
                  {(table || tableId) && <p className="text-[10px] text-amber-300/80 mt-1 uppercase">Allocated to Table {table || tableId}</p>}
                </div>
                
                {paymentMethod === 'bank_transfer' ? (
                  <div className="space-y-2">
                    <h3 className="font-bold text-zinc-300 uppercase tracking-wider">Official Bank Instruction</h3>
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-1.5">
                      <div className="flex justify-between"><span className="text-zinc-500">Bank Name:</span> <span className="text-white font-bold">Bank BCA (Official)</span></div>
                      <div className="flex justify-between items-center"><span className="text-zinc-500">Account No:</span> <span className="font-mono text-base font-extrabold text-amber-400">8723-612-874</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Beneficiary:</span> <span className="text-white font-bold">Cafein Today Ecosystem</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-center">Scan QRIS to Pay</h3>
                    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center">
                      <div className="w-48 h-48 bg-zinc-900 rounded-xl border-2 border-zinc-700 flex items-center justify-center mb-4 overflow-hidden relative">
                         <div className="absolute inset-0 bg-[radial-gradient(circle,#3f3f46_2px,transparent_2px)] [background-size:12px_12px]" />
                         <div className="z-10 bg-zinc-950 p-2 rounded-lg border border-zinc-700 font-bold text-white text-lg">QRIS</div>
                      </div>
                      <p className="text-zinc-400 text-center text-[10px]">Supported by GoPay, OVO, Dana, ShopeePay, and all Banking Apps</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-bold text-zinc-300 uppercase tracking-wider">Payment Verification Proof</h3>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp" 
                    capture="environment"
                    onChange={handleFileSelect}
                  />
                  <div 
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${uploadError ? 'border-rose-500/50' : 'border-zinc-700 hover:border-amber-500'} rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-950/50 hover:bg-zinc-950 transition-all group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${uploadError ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <p className={`text-sm font-bold mb-1 transition-colors ${uploadError ? 'text-rose-400' : 'text-white group-hover:text-amber-400'}`}>
                      {uploading ? 'Uploading & Verifying...' : 'Click to Upload Transfer Slip'}
                    </p>
                    <p className={`text-[11px] ${uploadError ? 'text-rose-500' : 'text-zinc-500'}`}>
                      {uploadError || 'Instant OCR & POS Sync (JPG, PNG up to 5MB)'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center text-zinc-100"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-white mb-2">Order Synchronized!</h2>
              <p className="text-zinc-400 text-xs font-mono mb-6 leading-relaxed">Your transfer slip is verified. Our barista team is now preparing your order for spatial delivery.</p>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 animate-pulse w-full" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Checkout Review Modal */}
      <AnimatePresence>
        {showReviewPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="card-luxury bg-zinc-900 border border-amber-500/40 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] relative text-zinc-100 font-mono text-xs"
            >
              <div className="text-center mb-6">
                <span className="text-[10px] uppercase bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">Resort Experience Audit</span>
                <h2 className="text-3xl font-heading font-extrabold text-white mt-3 tracking-tight">How Was Your Ritual?</h2>
                <p className="text-zinc-400 text-xs mt-1">Your feedback shapes our spatial coffee ecosystem.</p>
              </div>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none transition-all hover:scale-125"
                  >
                    <Star className={`w-9 h-9 ${reviewRating >= star ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'text-zinc-700'}`} />
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-2">Your Name (Optional)</label>
                  <input 
                    type="text" 
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Eleanor Richards"
                    className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-3.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-2">Patron Testimonial</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your beverage notes, service, and table atmosphere..."
                    rows={4}
                    className="input-luxury w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-3.5 text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 py-4" onClick={finishFlow}>Skip Review</Button>
                <Button variant="luxury" className="flex-1 py-4 gap-2" onClick={handleSubmitReview}>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-400 font-mono uppercase tracking-widest text-sm animate-pulse">Synchronizing Resort Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
