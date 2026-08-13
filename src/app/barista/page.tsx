'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Store, RefreshCw, CheckCircle2, Receipt, ArrowRight, Sparkles, Clock, Coffee, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api, Order, OrderDetail } from '@/lib/api';

type OrderStatus = 'pending_payment' | 'verifying' | 'preparing' | 'ready' | 'completed';

const Column = ({ title, status, nextStatus, nextLabel, columnOrders, setVerifyingOrder, moveOrder, badgeColor }: { 
  title: string, 
  status: OrderStatus, 
  nextStatus?: OrderStatus, 
  nextLabel?: string,
  columnOrders: Order[],
  setVerifyingOrder: (order: Order) => void,
  moveOrder: (id: string, nextStatus: OrderStatus) => void,
  badgeColor: string
}) => {
  return (
    <div className="flex-1 min-w-[320px] bg-[#1E1A17]/60 rounded-3xl p-5 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden border border-[#E5A93C]/20 shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E5A93C]/20">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${badgeColor} shadow-[0_0_10px_currentColor] animate-pulse`} />
          <h3 className="section-heading text-white uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <span className="bg-[#141210] text-[#E5A93C] border border-[#E5A93C]/30 px-3 py-1 rounded-full text-xs font-mono font-extrabold shadow-inner">
          {columnOrders.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        <AnimatePresence>
          {columnOrders.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-[#C6C0B4]/60 font-mono text-xs border border-dashed border-[#E5A93C]/20 rounded-2xl p-4">
              <Coffee className="w-8 h-8 text-[#C6C0B4]/40 mb-2 stroke-[1.5]" />
              <span>No orders in this station</span>
            </div>
          ) : (
            columnOrders.map(order => (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="card-luxury p-5 rounded-2xl flex flex-col group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#E5A93C] font-mono font-extrabold text-xs">
                      {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                    </span>
                    <span className="text-[#C6C0B4] font-mono text-xs font-bold">#{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#C6C0B4] text-[11px] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                
                <div className="mb-4 space-y-1">
                  <p className="section-heading text-base text-white group-hover:text-[#E5A93C] transition-colors">{order.customerName || 'Walk-in Patron'}</p>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C6C0B4]">
                    <span className={`w-1.5 h-1.5 rounded-full ${order.source === 'online' ? 'bg-sky-400' : 'bg-[#E5A93C]'}`} />
                    <span>{order.source === 'online' ? 'Online QR Ecosystem' : 'Barista POS Station'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#E5A93C]/20 flex justify-between items-center">
                  <div>
                    <span className="micro-label text-[9px] text-[#C6C0B4]/70 block mb-0.5">Total Amount</span>
                    <span className="text-sm font-mono font-extrabold text-[#E5A93C]">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  
                  {status === 'pending_payment' && (
                    <button 
                      onClick={() => setVerifyingOrder(order)} 
                      className="px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 border border-amber-500/30 hover:border-amber-500 font-mono font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Audit Slip</span>
                    </button>
                  )}
                  
                  {nextStatus && status !== 'pending_payment' && (
                    <button 
                      onClick={() => moveOrder(order.id, nextStatus)} 
                      className="px-4 py-2 rounded-xl bg-[#2B231D] hover:bg-[#E5A93C] text-[#C6C0B4] hover:text-[#141210] border border-[#E5A93C]/20 hover:border-[#E5A93C] font-mono font-bold text-xs transition-all flex items-center gap-1.5 group/btn shadow-md"
                    >
                      <span>{nextLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function BaristaDashboard() {
  const { data: orders = [], refetch } = useApiQuery('order-queue', () => api.orders.list());
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [verifyingOrderDetails, setVerifyingOrderDetails] = useState<OrderDetail | null>(null);

  React.useEffect(() => {
    if (verifyingOrder) {
      api.orders.get(verifyingOrder.id)
        .then(setVerifyingOrderDetails)
        .catch(console.error);
    } else {
      setVerifyingOrderDetails(null);
    }
  }, [verifyingOrder]);

  // Fetch store status
  const { data: storeStatus } = useApiQuery('store-status', () => api.store.getStatus());
  React.useEffect(() => {
    if (storeStatus) setIsStoreOpen(storeStatus.isOpen);
  }, [storeStatus]);

  const moveOrder = async (id: string, nextStatus: OrderStatus) => {
    try {
      await api.orders.updateStatus(id, nextStatus);
      refetch();
    } catch (err) {
      console.error('Failed to update order:', err);
    }
    setVerifyingOrder(null);
  };

  const toggleStore = async () => {
    try {
      const newStatus = !isStoreOpen;
      await api.store.setStatus({ isOpen: newStatus });
      setIsStoreOpen(newStatus);
    } catch (err) {
      console.error('Failed to toggle store:', err);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending_payment' || o.status === 'verifying');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans select-none text-[#FFFFFF]">
      {/* Top Bar Navigation */}
      <div className="bg-[#141210]/80 backdrop-blur-xl border-b border-[#E5A93C]/20 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="hero-title text-2xl text-white tracking-tight">Order Queue Board</h1>
            <span className="micro-label bg-[#E5A93C]/15 text-[#E5A93C] px-2.5 py-1 rounded-full border border-[#E5A93C]/30">Live Synchronized</span>
          </div>
          <p className="metadata-text mt-1">Real-time resort table order routing and preparation tracking.</p>
        </div>
        <div className="flex gap-3 items-center font-mono text-xs">
          <button 
            onClick={() => refetch()} 
            className="p-2.5 rounded-xl bg-[#1E1A17] border border-[#E5A93C]/20 hover:border-[#E5A93C]/50 text-[#C6C0B4] hover:text-white transition-all shadow-sm"
            title="Refresh Order Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={toggleStore}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-md ${
              isStoreOpen 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{isStoreOpen ? '● Ecosystem Open' : '○ Sanctuary Mode'}</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full min-w-[960px]">
          <Column 
            title="1. Awaiting Audit & Payment" 
            status="pending_payment"
            nextStatus="preparing"
            nextLabel="Confirm Order"
            columnOrders={pendingOrders}
            setVerifyingOrder={setVerifyingOrder}
            moveOrder={moveOrder}
            badgeColor="bg-rose-500"
          />
          <Column 
            title="2. Crafting in Progress" 
            status="preparing"
            nextStatus="ready"
            nextLabel="Mark Ready"
            columnOrders={preparingOrders}
            setVerifyingOrder={setVerifyingOrder}
            moveOrder={moveOrder}
            badgeColor="bg-amber-400"
          />
          <Column 
            title="3. Ready for Delivery / Pickup" 
            status="ready"
            nextStatus="completed"
            nextLabel="Complete Service"
            columnOrders={readyOrders}
            setVerifyingOrder={setVerifyingOrder}
            moveOrder={moveOrder}
            badgeColor="bg-emerald-400"
          />
        </div>
      </div>

      {/* Payment Verification Modal */}
      <AnimatePresence>
        {verifyingOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury p-8 max-w-md w-full shadow-2xl text-center text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-[#E5A93C]/10 blur-3xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl bg-[#E5A93C]/15 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] mx-auto mb-5 shadow-[0_0_25px_rgba(229,169,60,0.25)] animate-pulse">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="micro-label bg-[#E5A93C]/20 text-[#E5A93C] px-3 py-1.5 rounded-full border border-[#E5A93C]/30">Transfer Verification Audit</span>
              <h2 className="section-heading text-3xl text-white mt-4 mb-2">Verify Slip?</h2>
              <p className="metadata-text mb-6">Order #{verifyingOrder.orderNumber} • {verifyingOrder.customerName || 'Online Patron'}</p>
              
              <div className="bg-[#141210] border border-[#E5A93C]/20 p-5 rounded-2xl mb-8 space-y-2 text-left font-mono text-xs max-h-[40vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between"><span className="text-[#C6C0B4]">Table Allocation:</span> <span className="text-white font-bold">{verifyingOrder.tableNumber ? `Table ${verifyingOrder.tableNumber}` : 'Takeaway Station'}</span></div>
                <div className="flex justify-between"><span className="text-[#C6C0B4]">Payment Gateway:</span> <span className="text-[#E5A93C] font-bold uppercase">{verifyingOrder.paymentMethod || 'Bank Transfer'}</span></div>
                
                {verifyingOrderDetails ? (
                  <div className="pt-3 border-t border-[#E5A93C]/20 mt-3 space-y-2">
                    <span className="text-[#C6C0B4]">Order Items:</span>
                    <ul className="space-y-2">
                      {verifyingOrderDetails.items.map(item => (
                        <li key={item.id} className="flex flex-col text-white">
                          <div className="flex justify-between items-start">
                            <span><span className="font-bold text-[#E5A93C]">{item.quantity}x</span> {item.itemName || 'Unknown Item'}</span>
                            <span className="whitespace-nowrap ml-2">Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}</span>
                          </div>
                          {(item.iceLevel || item.sugarLevel || item.milkType) && (
                            <div className="text-[10px] text-[#C6C0B4] ml-5 mt-0.5">
                              {[item.iceLevel, item.sugarLevel, item.milkType].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-[#E5A93C]/20 mt-3 text-center text-[#C6C0B4] animate-pulse">
                    Retrieving itemized receipt...
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-3 border-t border-[#E5A93C]/20 mt-3">
                  <span className="micro-label text-[10px]">Total Amount Due</span>
                  <span className="text-xl font-extrabold text-[#E5A93C]">Rp {verifyingOrder.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="flex gap-3 font-mono text-xs">
                <Button 
                  variant="outline" 
                  className="flex-1 py-4 font-bold"
                  onClick={() => setVerifyingOrder(null)}
                >
                  Dismiss Audit
                </Button>
                <Button 
                  variant="luxury" 
                  className="flex-1 py-4 font-bold gap-1.5"
                  onClick={() => moveOrder(verifyingOrder.id, 'preparing')}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Verify & Prepare</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
