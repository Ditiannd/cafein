'use client';

import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const inventoryData = [
  { id: 'INV-001', name: 'Oat Milk (Oatly)', quantity: 4, unit: 'cartons', lastRestocked: '2023-10-24' },
  { id: 'INV-002', name: 'Gayo Arabica Beans', quantity: 15, unit: 'pax', lastRestocked: '2023-10-23' },
  { id: 'INV-003', name: 'Truffle Croissant', quantity: 24, unit: 'pcs', lastRestocked: '2023-10-25' },
  { id: 'INV-004', name: 'Matcha Powder (Kyoto)', quantity: 2, unit: 'box', lastRestocked: '2023-10-20' },
  { id: 'INV-005', name: 'Paper Cups 8oz', quantity: 3, unit: 'cartons', lastRestocked: '2023-10-15' },
  { id: 'INV-006', name: 'Caramel Syrup', quantity: 6, unit: 'liter', lastRestocked: '2023-10-22' },
];

export default function AdminInventory() {
  return (
    <div className="p-8 h-full bg-white/5 text-foreground flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Inventory Manager</h1>
          <p className="text-gray-500 mt-1">Track physical stock across boxes, pax, and cartons.</p>
        </div>
        <Button variant="luxury" className="gap-2">
          <Plus className="w-4 h-4" /> Add Stock Entry
        </Button>
      </div>

      <div className="bg-background rounded-2xl border border-white/10 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="pl-9 pr-4 py-2 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] w-64"
            />
          </div>
          <Button variant="outline" className="h-9 gap-2 text-gray-400 bg-background">
            <Filter className="w-4 h-4" /> Filter by Unit
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">Item ID</th>
                <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">Item Name</th>
                <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">Stock Quantity</th>
                <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">Unit (UoM)</th>
                <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">Last Restocked</th>
                <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-white/10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventoryData.map((item) => (
                <tr key={item.id} className="hover:bg-white/5/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[var(--color-brand-accent)]">
                    {item.quantity}
                    {item.quantity < 5 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Low</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 uppercase tracking-wider font-semibold text-[10px]">{item.unit}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.lastRestocked}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button className="text-[var(--color-brand-accent)] hover:text-white font-medium text-sm transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
