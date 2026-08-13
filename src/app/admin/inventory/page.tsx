'use client';

import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api, InventoryItem } from '@/lib/api';

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', minThreshold: '10' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const { data: inventoryList, isLoading, refetch } = useApiQuery<InventoryItem[]>('inventory', () => api.inventory.list());

  const handleCreateItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.unit) return;
    setIsSubmitting(true);
    try {
      await api.inventory.create({
        name: newItem.name,
        quantity: parseInt(newItem.quantity),
        unit: newItem.unit,
        minThreshold: parseInt(newItem.minThreshold),
      });
      setIsAddModalOpen(false);
      setNewItem({ name: '', quantity: '', unit: '', minThreshold: '10' });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!itemToAdjust || adjustQuantity === '') return;
    setIsAdjusting(true);
    try {
      await api.inventory.update(itemToAdjust.id, {
        quantity: parseInt(adjustQuantity),
      });
      setIsAdjustModalOpen(false);
      setItemToAdjust(null);
      setAdjustQuantity('');
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to adjust inventory item');
    } finally {
      setIsAdjusting(false);
    }
  };

  const inventory = inventoryList || [];
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(item.id).includes(searchTerm)
  );

  const lowStockCount = inventory.filter(i => i.quantity <= i.minThreshold).length;

  return (
    <div className="p-8 h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Inventory & Stock Ledger</h1>
            <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">Resort Supply Vault</span>
          </div>
          <p className="text-zinc-400 text-xs font-mono mt-1">Audit physical raw materials, coffee bean reserves, and eco-packaging consumption.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="luxury" onClick={() => setIsAddModalOpen(true)} className="gap-2 text-xs font-bold py-5 px-6">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record Supply Inflow</span>
          </Button>
        </div>
      </div>

      {/* Status Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 font-mono">
        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Total SKU Lines</span>
            <span className="text-2xl font-extrabold text-white font-sans">{inventory.length} Active Items</span>
          </div>
        </div>

        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Low Stock Alerts</span>
            <span className="text-2xl font-extrabold text-rose-400 font-sans">{lowStockCount} Requires Restock</span>
          </div>
        </div>

        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Supply Chain Audit</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-sans">100% Verified</span>
          </div>
        </div>
      </div>

      <div className="card-luxury bg-zinc-900/60 rounded-3xl border border-zinc-800/80 shadow-2xl flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-950/60 backdrop-blur-md font-mono text-xs">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by SKU ID or name..." 
              className="input-luxury w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-zinc-600 focus:border-amber-500"
            />
          </div>
          <div className="text-zinc-500 font-bold">
            Showing <span className="text-amber-400">{filteredInventory.length}</span> of {inventory.length} records
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-950/90 sticky top-0 z-10 text-zinc-400 uppercase font-bold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">SKU ID</th>
                  <th className="px-6 py-4">Supply Item Name</th>
                  <th className="px-6 py-4">Stock Reserve</th>
                  <th className="px-6 py-4">Unit (UoM)</th>
                  <th className="px-6 py-4">Last Restock Audit</th>
                  <th className="px-6 py-4 text-right">Ledger Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredInventory.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/90 transition-all group">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-500 group-hover:text-amber-400 transition-colors">INV-{item.id.toString().padStart(3, '0')}</td>
                      <td className="px-6 py-4 font-heading font-extrabold text-sm text-white">{item.name}</td>
                      <td className="px-6 py-4 font-mono text-sm font-extrabold">
                        <div className="flex items-center gap-2">
                          <span className={isLow ? 'text-rose-400' : 'text-amber-400'}>{item.quantity}</span>
                          {isLow && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase animate-pulse">
                              Low Reserve
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs uppercase tracking-wider font-bold">{item.unit}</td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                        {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <button 
                          onClick={() => {
                            setItemToAdjust(item);
                            setAdjustQuantity(item.quantity.toString());
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 border border-zinc-700 hover:border-amber-500 font-bold text-xs transition-all"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Inventory Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-zinc-100 font-mono text-xs"
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-800/80 bg-zinc-950/80 font-heading font-extrabold text-base text-white">
                <div className="flex items-center gap-2 text-amber-400">
                  <Package className="w-4 h-4" />
                  <span>Record New Supply Item</span>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="p-6 space-y-4 bg-zinc-950/40">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Item Name</label>
                  <input 
                    type="text" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white font-bold text-sm" 
                    placeholder="e.g. Oat Milk Barista Edition" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase font-bold mb-1.5">Initial Quantity</label>
                    <input 
                      type="number" 
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                      className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" 
                      placeholder="0" 
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase font-bold mb-1.5">Unit (UoM)</label>
                    <input 
                      type="text" 
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" 
                      placeholder="e.g. cartons, pcs, pax" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Low Stock Threshold</label>
                  <input 
                    type="number" 
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({...newItem, minThreshold: e.target.value})}
                    className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" 
                  />
                </div>
              </div>

              <div className="p-6 bg-zinc-950 flex gap-3 justify-end border-t border-zinc-800/80 font-sans">
                <Button variant="outline" className="flex-1 py-4 font-bold text-xs" onClick={() => setIsAddModalOpen(false)}>Dismiss</Button>
                <Button variant="luxury" className="flex-1 py-4 font-bold text-xs gap-1.5" onClick={handleCreateItem} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? 'Recording...' : 'Add to Inventory'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {isAdjustModalOpen && itemToAdjust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl text-zinc-100 font-mono text-xs"
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-800/80 bg-zinc-950/80 font-heading font-extrabold text-base text-white">
                <div className="flex items-center gap-2 text-amber-400">
                  <Package className="w-4 h-4" />
                  <span>Adjust Stock: {itemToAdjust.name}</span>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="p-6 space-y-4 bg-zinc-950/40">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">New Quantity ({itemToAdjust.unit})</label>
                  <input 
                    type="number" 
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white font-bold text-sm" 
                  />
                </div>
              </div>

              <div className="p-6 bg-zinc-950 flex gap-3 justify-end border-t border-zinc-800/80 font-sans">
                <Button variant="outline" className="flex-1 py-4 font-bold text-xs" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
                <Button variant="luxury" className="flex-1 py-4 font-bold text-xs gap-1.5" onClick={handleAdjustStock} disabled={isAdjusting}>
                  {isAdjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isAdjusting ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
