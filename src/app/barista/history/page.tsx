'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, ChevronRight, X, Printer, Coffee, History, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api, Order, OrderDetail } from '@/lib/api';
import { useApiQuery } from '@/lib/hooks';

export default function OrderHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { data: orders, isLoading } = useApiQuery<Order[]>('order-history', () => api.orders.list());

  // Filter only completed/cancelled orders for history
  const completedOrders = (orders || []).filter(o => o.status === 'completed' || o.status === 'cancelled');

  const filteredOrders = completedOrders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.createdAt.includes(searchTerm) ||
    (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewOrder = async (orderId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.orders.get(orderId);
      setSelectedOrder(detail);
    } catch (err) {
      console.error('Failed to load order detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return 'N/A';
    return method.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto w-full font-sans select-none text-[#FFFFFF] print:p-0 print:m-0 print:block">
      <div className="flex justify-between items-center mb-8 pb-5 border-b border-[#E5A93C]/20/80 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Transaction Ledger</h1>
            <span className="text-[10px] font-mono uppercase bg-[#E5A93C]/15 text-[#E5A93C] px-3 py-1 rounded-full border border-[#E5A93C]/30 font-bold">Historical Vault</span>
          </div>
          <p className="text-[#C6C0B4] text-xs font-mono mt-1">Audit and search all historical resort transactions, POS settlements, and table slips.</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4 print:hidden">
        <div className="relative w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#C6C0B4]" />
          <input 
            type="text"
            placeholder="Search by Transaction ID, Date or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxury w-full bg-[#1E1A17] border border-[#E5A93C]/20 focus:border-[#E5A93C] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 shadow-inner"
          />
        </div>
      </div>

      <div className="card-luxury bg-[#1E1A17]/60 border border-[#E5A93C]/20/80 rounded-3xl overflow-hidden flex-1 flex flex-col shadow-2xl print:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#E5A93C] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#E5A93C]/20 text-[#C6C0B4] bg-[#141210]/80 uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Service Type / Table</th>
                  <th className="py-4 px-6">Settlement Method</th>
                  <th className="py-4 px-6 text-right">Settled Amount</th>
                  <th className="py-4 px-6 text-right">Audit Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-[#1E1A17]/90 transition-all group cursor-pointer" 
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-white group-hover:text-[#E5A93C] transition-colors">{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6 text-[#C6C0B4] font-mono text-xs">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-[#ECE6DD] font-bold">{order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'}</span>
                        {order.tableNumber ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-[#E5A93C]/15 text-[#E5A93C] border border-[#E5A93C]/30 font-bold">Table {order.tableNumber}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-[#2B231D] text-[#C6C0B4] border border-[#E5A93C]/30">Counter</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#141210] text-[#E5A93C] border border-[#E5A93C]/20 uppercase tracking-widest">
                        {formatPaymentMethod(order.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-extrabold text-[#E5A93C] text-sm">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-[#C6C0B4] group-hover:text-[#E5A93C] transition-colors inline-flex items-center gap-1 font-mono text-xs font-bold">
                        <span>View Slip</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-[#C6C0B4] font-mono">
                      <History className="w-10 h-10 mx-auto text-zinc-700 mb-2 stroke-[1.5]" />
                      <span>No matching historical transactions found in vault.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Copy Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono print:static print:bg-transparent print:p-0 print:block">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-[#141210] text-[#FFFFFF] rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col relative border border-[#E5A93C]/20 text-xs print:bg-white print:text-black print:border-none print:shadow-none print:w-[80mm] print:max-w-none print:p-0 print:m-0 print:rounded-none"
            >
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-2 text-[#C6C0B4] hover:text-white bg-[#1E1A17] rounded-xl transition-colors z-10 print:hidden"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center border-b border-dashed border-[#E5A93C]/20 pb-5 mb-5 space-y-1 print:border-black print:pb-3 print:mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/30 font-bold text-[10px] mb-2 print:border-black print:bg-transparent print:text-black">
                  <ShieldCheck className="w-3 h-3 print:hidden" />
                  <span>Historical Audit Slip</span>
                </div>
                <h2 className="text-lg font-heading font-extrabold uppercase tracking-widest text-white print:text-black">Cafein Today</h2>
                <p className="text-[#C6C0B4] text-[10px] print:text-black">Sanctuary Ledger Copy • Archived</p>
                <p className="text-[#C6C0B4] text-[10px] print:text-black">{formatDate(selectedOrder.createdAt)}</p>
                <div className="pt-2 mt-2 border-t border-zinc-900 flex justify-between font-bold text-[#E5A93C] print:text-black print:border-black">
                  <span>{selectedOrder.orderNumber}</span>
                  <span>{selectedOrder.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'} {selectedOrder.tableNumber ? `(${selectedOrder.tableNumber})` : ''}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-5 min-h-[140px] space-y-3 custom-scrollbar print:overflow-visible print:min-h-0 print:mb-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-white print:text-black">
                      <span className="truncate pr-2">{item.quantity}x {item.itemName || 'Item'}</span>
                      <span className="text-[#E5A93C] shrink-0 print:text-black">Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                    {(item.iceLevel || item.sugarLevel || item.milkType) && (
                      <div className="text-[10px] text-[#C6C0B4] ml-4 leading-tight print:text-black">
                        {[item.iceLevel, item.sugarLevel, item.milkType].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-[#E5A93C]/20 pt-4 mb-6 space-y-1.5 text-[#C6C0B4] print:border-black print:text-black print:pt-3 print:mb-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {selectedOrder.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {selectedOrder.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-400 font-bold print:text-black">
                    <span>Discount Allocation</span>
                    <span>-Rp {selectedOrder.discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Resort Tax (11%)</span>
                  <span>Rp {selectedOrder.tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-2 mt-1 border-t border-zinc-900 text-white print:border-black print:text-black">
                  <span>Total Settled</span>
                  <span className="text-[#E5A93C] print:text-black">Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-3 text-[10px] uppercase text-[#C6C0B4] print:text-black">
                  <span>Settlement Method</span>
                  <span className="text-[#ECE6DD] font-bold print:text-black">{formatPaymentMethod(selectedOrder.paymentMethod)}</span>
                </div>
                {selectedOrder.amountPaid && (
                  <div className="flex justify-between text-[10px] uppercase text-[#C6C0B4] print:text-black">
                    <span>Amount Paid</span>
                    <span className="text-[#ECE6DD] print:text-black">Rp {selectedOrder.amountPaid.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {selectedOrder.changeGiven && selectedOrder.changeGiven > 0 && (
                  <div className="flex justify-between text-[10px] uppercase text-emerald-400 font-bold print:text-black">
                    <span>Change Returned</span>
                    <span>Rp {selectedOrder.changeGiven.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div className="font-sans print:hidden">
                <Button variant="luxury" className="w-full py-4 text-xs font-bold gap-2" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5" />
                  <span>Reprint Physical Slip</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
