'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Store, RefreshCw, CheckCircle, Receipt, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api, Order } from '@/lib/api';

type OrderStatus = 'pending_payment' | 'verifying' | 'preparing' | 'ready' | 'completed';

const Column = ({ title, status, nextStatus, nextLabel, columnOrders, setVerifyingOrder, moveOrder }: { 
  title: string, 
  status: OrderStatus, 
  nextStatus?: OrderStatus, 
  nextLabel?: string,
  columnOrders: Order[],
  setVerifyingOrder: (order: Order) => void,
  moveOrder: (id: string, nextStatus: OrderStatus) => void
}) => {
  return (
    <div className="flex-1 min-w-[300px] bg-white/5 rounded-xl p-4 flex flex-col h-[calc(100vh-8rem)] overflow-hidden border border-white/20/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-300 uppercase tracking-wider text-sm">{title}</h3>
        <span className="bg-white/10 text-gray-400 px-2 py-1 rounded-md text-xs font-bold">{columnOrders.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence>
          {columnOrders.map(order => (
            <motion.div 
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-background p-4 rounded-xl border border-white/20 shadow-sm flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-[var(--color-brand-accent)]">{order.tableNumber || 'N/A'}</span>
                  <span className="text-gray-500 text-xs ml-2">{order.orderNumber}</span>
                </div>
                <span className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleTimeString()}</span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-200">{order.customerName || 'Walk-in'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.source === 'online' ? '🌐 Online Order' : '🏪 POS Order'}
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Rp {order.totalAmount.toLocaleString()}</span>
                
                {status === 'pending_payment' && (
                  <Button size="sm" onClick={() => setVerifyingOrder(order)} className="text-xs h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-none">
                    <Receipt className="w-3 h-3 mr-1" /> Verify
                  </Button>
                )}
                
                {nextStatus && status !== 'pending_payment' && (
                  <Button size="sm" onClick={() => moveOrder(order.id, nextStatus)} className="text-xs h-8 bg-gray-900 text-white hover:bg-gray-800 shadow-none">
                    {nextLabel} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function BaristaDashboard() {
  const { data: orders = [], refetch } = useApiQuery('order-queue', () => api.orders.list());
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);

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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-white/10 p-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Order Queue</h1>
          <p className="text-gray-500 text-sm">Manage live orders and preparation status.</p>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleStore}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isStoreOpen ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
          >
            <Store className="w-4 h-4" />
            <span>{isStoreOpen ? 'Store Open' : 'Store Closed'}</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full min-w-[900px]">
          <Column 
            title="Awaiting Payment" 
            status="pending_payment"
            nextStatus="preparing"
            nextLabel="Start"
            columnOrders={pendingOrders}
            setVerifyingOrder={setVerifyingOrder}
            moveOrder={moveOrder}
          />
          <Column 
            title="Preparing" 
            status="preparing"
            nextStatus="ready"
            nextLabel="Ready"
            columnOrders={preparingOrders}
            setVerifyingOrder={setVerifyingOrder}
            moveOrder={moveOrder}
          />
          <Column 
            title="Ready to Pickup" 
            status="ready"
            nextStatus="completed"
            nextLabel="Done"
            columnOrders={readyOrders}
            setVerifyingOrder={setVerifyingOrder}
            moveOrder={moveOrder}
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <CheckCircle className="w-16 h-16 text-[var(--color-brand-accent)] mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-semibold mb-2">Verify Payment?</h2>
              <p className="text-gray-400 text-sm mb-2">{verifyingOrder.orderNumber}</p>
              <p className="text-lg font-semibold text-[var(--color-brand-accent)] mb-8">
                Rp {verifyingOrder.totalAmount.toLocaleString('id-ID')}
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setVerifyingOrder(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="luxury" 
                  className="flex-1"
                  onClick={() => moveOrder(verifyingOrder.id, 'preparing')}
                >
                  Confirm & Prepare
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
