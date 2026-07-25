'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Plus, ShoppingBag, X, CheckCircle2, Upload, Star } from 'lucide-react';
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

  // Modifiers state
  const [iceLevel, setIceLevel] = useState('Normal');
  const [sugarLevel, setSugarLevel] = useState('Normal');
  const [milkType, setMilkType] = useState('Fresh Milk');

  const [showPaymentUpload, setShowPaymentUpload] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

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
    setShowPaymentUpload(true);
  };

  const handlePaymentUpload = async () => {
    try {
      // Group cart items by catalogItemId
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
        customerName: 'Online Customer',
        orderType: 'dine_in',
        tableNumber: table || undefined,
        paymentMethod: 'bank_transfer',
      });

      setCurrentOrderId(order.id);
      setShowPaymentUpload(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowReviewPrompt(true);
      }, 2500);
    } catch (err) {
      console.error('Order failed:', err);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await api.reviews.create({
        author: reviewAuthor || 'Anonymous Guest',
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-background border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Coffee className="w-6 h-6 text-[var(--color-brand-accent)]" />
            <div className="flex flex-col">
              <h1 className="font-heading font-semibold text-lg uppercase tracking-widest text-foreground">Cafein Today</h1>
              {table && <span className="text-[10px] text-[var(--color-brand-accent)] font-semibold uppercase">Table {table}</span>}
            </div>
          </Link>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-foreground hover:text-[var(--color-brand-accent)] transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute top-1 right-0 w-4 h-4 bg-[var(--color-brand-accent)] text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Categories */}
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto hide-scrollbar gap-6 py-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat!)}
              className={`whitespace-nowrap text-sm font-medium uppercase tracking-wider transition-colors pb-1 border-b-2 ${
                activeCategory === cat 
                  ? 'border-[var(--color-brand-accent)] text-foreground' 
                  : 'border-transparent text-[var(--color-brand-muted)] hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.filter(item => item.category === activeCategory).map(item => {
            const finalPrice = getItemPrice(item);
            const hasDiscount = item.discountType && item.discountValue;
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-background rounded-2xl overflow-hidden border border-white/10 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {item.badge && item.badge !== '-' && (
                    <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-accent)] shadow-sm border border-[var(--color-brand-accent)]/20">
                      {item.badge}
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-white">
                      {item.discountType === 'percentage' ? `-${item.discountValue}%` : `-Rp ${item.discountValue!.toLocaleString('id-ID')}`}
                    </div>
                  )}
                </div>
                <div className="p-5 flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-semibold text-lg">{item.name}</h3>
                    {hasDiscount ? (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[var(--color-brand-accent)] font-medium text-sm">Rp {finalPrice.toLocaleString('id-ID')}</p>
                        <p className="text-gray-500 line-through text-xs">Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                    ) : (
                      <p className="text-[var(--color-brand-muted)] text-sm mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                    )}
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-foreground group-hover:bg-[var(--color-brand-accent)] group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-background rounded-t-3xl z-50 overflow-hidden flex flex-col h-[85vh] shadow-2xl"
            >
              <div className="relative h-48 bg-white/5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h2 className="font-heading text-2xl font-semibold mb-1">{selectedItem.name}</h2>
                  <p className="text-[var(--color-brand-accent)] font-medium">Rp {getItemPrice(selectedItem).toLocaleString('id-ID')}</p>
                </div>

                {selectedItem.category !== 'Pastries' && (
                  <>
                    {/* Ice Level */}
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Ice Level</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['Less Ice', 'Normal', 'Extra Ice'].map(level => (
                          <button
                            key={level}
                            onClick={() => setIceLevel(level)}
                            className={`py-2 rounded-lg text-sm transition-colors border ${iceLevel === level ? 'bg-[var(--color-brand-dark)] text-white border-[var(--color-brand-dark)]' : 'bg-background border-white/20 text-gray-400 hover:border-white/20'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sugar Level */}
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Sugar Level</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['Less Sugar', 'Normal', 'Extra Sugar'].map(level => (
                          <button
                            key={level}
                            onClick={() => setSugarLevel(level)}
                            className={`py-2 rounded-lg text-sm transition-colors border ${sugarLevel === level ? 'bg-[var(--color-brand-dark)] text-white border-[var(--color-brand-dark)]' : 'bg-background border-white/20 text-gray-400 hover:border-white/20'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Milk Option */}
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Milk Option</h4>
                      <div className="space-y-2">
                        {['Fresh Milk', 'Oat Milk (+10k)', 'Almond Milk (+12k)'].map(milk => (
                          <button
                            key={milk}
                            onClick={() => setMilkType(milk)}
                            className={`w-full py-3 px-4 text-left rounded-lg text-sm transition-colors border flex justify-between items-center ${milkType === milk ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-background border-white/20 text-gray-400 hover:border-white/20'}`}
                          >
                            <span>{milk.split(' (')[0]}</span>
                            {milk.includes('(') && <span className="text-xs opacity-60">{milk.split(' ')[2]}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-background shrink-0">
                <Button variant="luxury" className="w-full py-6 text-sm" onClick={handleAddToCart}>
                  Add to Cart • Rp {getItemPrice(selectedItem).toLocaleString('id-ID')}
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="font-heading font-semibold text-xl">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">Cart is empty</p>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        {item.category !== 'Pastries' && (
                          <p className="text-xs text-gray-500 mt-1">{item.modifiers.iceLevel} • {item.modifiers.sugarLevel} • {item.modifiers.milkType}</p>
                        )}
                        <p className="font-semibold text-sm mt-2 text-[var(--color-brand-accent)]">Rp {getItemPrice(item).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-white/10 bg-background">
                  <div className="flex justify-between mb-4 font-semibold text-lg">
                    <span>Total</span>
                    <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <Button variant="luxury" className="w-full py-6 text-sm" onClick={handleCheckout}>
                    Checkout Now
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-background border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="font-heading font-semibold text-xl">Payment Details</h2>
                <button onClick={() => setShowPaymentUpload(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-[var(--color-brand-accent)]/10 border border-[var(--color-brand-accent)]/20 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-400 mb-1">Total to Pay</p>
                  <p className="text-2xl font-semibold text-[var(--color-brand-accent)]">Rp {cartTotal.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-300">Bank Transfer Instruction</h3>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm">
                    <p className="text-gray-400 mb-1">Bank BCA</p>
                    <p className="font-mono text-lg text-white mb-1">8723612874</p>
                    <p className="text-gray-400">a/n Cafein Today Official</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-300">Upload Receipt</h3>
                  <div 
                    onClick={handlePaymentUpload}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-brand-accent)] hover:bg-white/5 transition-colors group"
                  >
                    <Upload className="w-8 h-8 text-gray-500 mb-3 group-hover:text-[var(--color-brand-accent)] transition-colors" />
                    <p className="text-sm text-gray-300 font-medium mb-1">Click to upload payment proof</p>
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--color-brand-dark)] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-heading font-semibold text-white mb-2">Order Processing!</h2>
              <p className="text-gray-400 text-sm mb-6">Your payment proof has been uploaded. Please wait while our barista verifies your order.</p>
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
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-background border border-[var(--color-brand-accent)]/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.1)] relative"
            >
              <h2 className="text-3xl font-heading font-semibold text-white mb-2 text-center">How was it?</h2>
              <p className="text-gray-400 text-sm mb-8 text-center">Your feedback means the world to us.</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 ${reviewRating >= star ? 'fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name (Optional)</label>
                  <input 
                    type="text" 
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Eleanor Richards"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Review</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you loved..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={finishFlow}>Skip</Button>
                <Button variant="luxury" className="flex-1" onClick={handleSubmitReview}>Submit</Button>
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
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
}
