'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, ChevronRight, X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock historical orders
const mockOrderHistory = [
  {
    id: 'ORD-5829-1738',
    date: '2023-11-15 14:30',
    orderType: 'Dine In',
    tableId: 'T2',
    subtotal: 90000,
    tax: 9900,
    discountTotal: 0,
    total: 99900,
    paymentMethod: 'qris',
    status: 'Completed',
    cart: [
      { id: '1', quantity: 2, menuItem: { name: 'Oat Milk Latte', price: 45000 }, modifiers: { iceLevel: 'Normal', sugarLevel: 'Less', milkType: 'Oat Milk' } }
    ]
  },
  {
    id: 'ORD-5829-1739',
    date: '2023-11-15 15:15',
    orderType: 'Takeaway',
    tableId: null,
    subtotal: 63000,
    tax: 6930,
    discountTotal: 7000,
    total: 62930,
    paymentMethod: 'cash',
    amountPaid: 100000,
    change: 37070,
    status: 'Completed',
    cart: [
      { id: '2', quantity: 1, menuItem: { name: 'Truffle Croissant', price: 38000 } },
      { id: '3', quantity: 1, menuItem: { name: 'Almond Choco Brownie', price: 25000, discountPrice: 18000 } }
    ]
  },
  {
    id: 'ORD-5828-1120',
    date: '2023-11-14 09:10',
    orderType: 'Dine In',
    tableId: 'C1',
    subtotal: 35000,
    tax: 3850,
    discountTotal: 0,
    total: 38850,
    paymentMethod: 'card',
    status: 'Completed',
    cart: [
      { id: '4', quantity: 1, menuItem: { name: 'Classic Cappuccino', price: 35000 } }
    ]
  }
];

export default function OrderHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = mockOrderHistory.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.date.includes(searchTerm)
  );

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-white mb-2">Order History</h1>
          <p className="text-gray-400">View and search all past transactions and receipts.</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text"
            placeholder="Search by Order ID or Date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            <Calendar className="w-4 h-4" /> Filter by Date
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-sm bg-white/[0.02]">
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Order ID</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Date & Time</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Type / Table</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Payment</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider text-right">Total</th>
                <th className="py-4 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="py-4 px-6">
                    <span className="font-mono text-white">#{order.id.split('-')[1]}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">{order.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">{order.orderType}</span>
                      {order.tableId && (
                        <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white border border-white/10">T-{order.tableId}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-gray-300 uppercase tracking-wider">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-[var(--color-brand-accent)]">
                    Rp {order.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-500 group-hover:text-[var(--color-brand-accent)] transition-colors inline-flex items-center gap-1 text-sm">
                      View <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-black rounded-lg p-8 max-w-sm w-full shadow-2xl flex flex-col font-mono relative"
            >
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-1">Cafein Today</h2>
                <p className="text-xs text-gray-500">Historical Receipt Copy</p>
                <p className="text-xs text-gray-500">{selectedOrder.date}</p>
                <div className="mt-3">
                  <p className="font-bold text-sm uppercase">Order #{selectedOrder.id.split('-')[1].substring(0,4)}</p>
                  <p className="text-sm font-semibold">{selectedOrder.orderType} {selectedOrder.tableId ? `- Table ${selectedOrder.tableId}` : ''}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 min-h-[150px]">
                {selectedOrder.cart.map((item: any) => {
                  const effectivePrice = item.menuItem.discountPrice || item.menuItem.price;
                  return (
                    <div key={item.id} className="mb-3 text-sm">
                      <div className="flex justify-between font-semibold">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span>{(effectivePrice * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                      {item.modifiers && (
                        <div className="text-xs text-gray-500 ml-5 leading-tight">
                          {item.modifiers.iceLevel}, {item.modifiers.sugarLevel}, {item.modifiers.milkType}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Subtotal</span>
                  <span>Rp {selectedOrder.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {selectedOrder.discountTotal > 0 && (
                  <div className="flex justify-between mb-1 text-red-500">
                    <span>Discount</span>
                    <span>-Rp {selectedOrder.discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between mb-1">
                  <span>Tax (11%)</span>
                  <span>Rp {selectedOrder.tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-2">
                  <span>Total</span>
                  <span>Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between mt-4 text-gray-500 text-xs uppercase">
                  <span>Payment Method</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
                {selectedOrder.amountPaid && (
                  <div className="flex justify-between text-gray-500 text-xs uppercase mt-1">
                    <span>Amount Paid</span>
                    <span>Rp {selectedOrder.amountPaid.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {selectedOrder.change > 0 && (
                  <div className="flex justify-between text-gray-500 text-xs uppercase mt-1">
                    <span>Change</span>
                    <span>Rp {selectedOrder.change.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full bg-gray-100 text-black border-transparent hover:bg-gray-200">
                <Printer className="w-4 h-4 mr-2" /> Print Copy
              </Button>
              
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-200 via-white to-gray-200 opacity-50" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
