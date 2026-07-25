'use client';

import React, { useState } from 'react';
import { RefreshCw, Power, PowerOff, Circle, RectangleHorizontal, Sofa, Square, ShoppingBag, Clock, CheckCircle2, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const TABLE_ICONS: Record<string, LucideIcon> = {
  round: Circle,
  rectangle: RectangleHorizontal,
  couch: Sofa,
  bar: Square
};

interface TableModel {
  id: string;
  label: string;
  type: string;
  capacity: number;
  isAvailable: boolean;
  x: number;
  y: number;
  order?: {
    ticketNumber: string;
    items: string[];
    time: string;
    total: number;
  }
}

const INITIAL_TABLES: TableModel[] = [
  { id: '1', label: 'T1', type: 'round', capacity: 2, isAvailable: false, x: 25, y: 25, order: { ticketNumber: '1042', items: ['2x Signature Latte', '1x Butter Croissant'], time: '45 mins ago', total: 110000 } },
  { id: '2', label: 'T2', type: 'round', capacity: 2, isAvailable: true, x: 75, y: 25 },
  { id: '3', label: 'T3', type: 'rectangle', capacity: 4, isAvailable: false, x: 50, y: 50, order: { ticketNumber: '1045', items: ['4x Kyoto Matcha Blend', '2x Tiramisu'], time: '1 hr 15 mins ago', total: 240000 } },
  { id: '4', label: 'T4', type: 'rectangle', capacity: 4, isAvailable: true, x: 25, y: 75 },
  { id: '5', label: 'C1', type: 'couch', capacity: 6, isAvailable: false, x: 75, y: 75, order: { ticketNumber: '1048', items: ['2x Americano', '1x Filter Coffee'], time: '20 mins ago', total: 95000 } },
  { id: '6', label: 'Bar', type: 'bar', capacity: 1, isAvailable: true, x: 50, y: 15 },
];

export default function BaristaTablesPage() {
  const [tables, setTables] = useState<TableModel[]>(INITIAL_TABLES);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const toggleTableStatus = (id: string) => {
    setTables(tables.map(t => {
      if (t.id === id) {
        if (t.isAvailable) {
          // Mark as Occupied (Mock a new order arriving)
          return {
            ...t,
            isAvailable: false,
            order: {
              ticketNumber: Math.floor(1000 + Math.random() * 9000).toString(),
              items: ['Walk-in Order'],
              time: 'Just now',
              total: 0
            }
          };
        } else {
          // Clear Table (Mark as available)
          return {
            ...t,
            isAvailable: true,
            order: undefined
          };
        }
      }
      return t;
    }));
  };

  const resetAllTables = () => {
    setTables(tables.map(t => ({ ...t, isAvailable: true, order: undefined })));
    setSelectedTableId(null);
  };

  const toggleStoreStatus = () => {
    setIsStoreOpen(!isStoreOpen);
  };

  const occupiedCount = tables.filter(t => !t.isAvailable).length;
  const totalCount = tables.length;

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Store & Tables</h1>
            <p className="text-gray-400">Spatial overview of floor plan and active orders.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={resetAllTables}
              className="bg-background border-white/20 text-gray-300 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reset All Tables
            </Button>
            <button 
              onClick={toggleStoreStatus}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all duration-300 ${
                isStoreOpen 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:bg-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
              }`}
            >
              {isStoreOpen ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
              {isStoreOpen ? 'Store Open' : 'Store Closed'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-gray-400 font-medium mb-1">Occupancy Rate</h3>
            <p className="text-3xl font-heading font-semibold text-white">
              {Math.round((occupiedCount / totalCount) * 100)}%
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-gray-400 font-medium mb-1">Occupied Tables</h3>
            <p className="text-3xl font-heading font-semibold text-white">{occupiedCount} / {totalCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-gray-400 font-medium mb-1">Operating Status</h3>
            <p className={`text-xl font-heading font-semibold uppercase tracking-widest mt-2 ${isStoreOpen ? 'text-green-400' : 'text-red-400'}`}>
              {isStoreOpen ? 'Accepting Orders' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Workspace: Canvas + Details Panel */}
        <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
          
          {/* Spatial Canvas Area */}
          <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-8 relative min-h-[400px] shadow-inner overflow-hidden flex items-center justify-center">
            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            {/* Floor Plan */}
            <div className="relative w-full max-w-lg aspect-square">
              {tables.map((table) => {
                const Icon = TABLE_ICONS[table.type];
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`
                      absolute p-3 rounded-xl transition-all duration-300 flex flex-col items-center justify-center
                      ${selectedTableId === table.id 
                        ? 'bg-[var(--color-brand-accent)] text-white scale-110 shadow-lg shadow-black/20 z-20 border border-[var(--color-brand-accent)]' 
                        : table.isAvailable
                          ? 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/30 hover:text-white z-10 shadow-sm backdrop-blur-sm'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20 z-10 shadow-sm backdrop-blur-sm'
                      }
                    `}
                    style={{
                      left: `${table.x}%`,
                      top: `${table.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '90px',
                      height: '90px'
                    }}
                  >
                    <Icon strokeWidth={1} className="w-8 h-8 mb-1" />
                    <span className="text-xs font-semibold uppercase tracking-widest">{table.label}</span>

                    {!table.isAvailable && selectedTableId !== table.id && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-full md:w-96 bg-[var(--color-brand-dark)] rounded-2xl border border-white/10 flex flex-col shadow-xl overflow-hidden shrink-0">
            {selectedTable ? (
              <div className="flex flex-col h-full">
                
                {/* Panel Header */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-heading font-bold text-3xl text-white">{selectedTable.label}</h3>
                      <p className="text-gray-400 text-sm">{selectedTable.capacity} Pax Capacity</p>
                    </div>
                    {selectedTable.isAvailable ? (
                      <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] uppercase font-bold tracking-widest rounded-full border border-green-500/20">
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold tracking-widest rounded-full border border-red-500/20">
                        Occupied
                      </span>
                    )}
                  </div>
                </div>

                {/* Panel Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                  {!selectedTable.isAvailable && selectedTable.order ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" /> Order #{selectedTable.order.ticketNumber}
                        </span>
                        <span className="text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {selectedTable.order.time}
                        </span>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <ul className="space-y-3 mb-4">
                          {selectedTable.order.items.map((item, idx) => (
                            <li key={idx} className="text-white text-sm flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)] mt-1.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between items-center pt-3 border-t border-white/10">
                          <span className="text-gray-400 text-sm">Total</span>
                          <span className="text-white font-semibold">Rp {selectedTable.order.total.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <CheckCircle2 className="text-green-500/50 w-8 h-8" />
                      </div>
                      <h4 className="text-white font-medium mb-2">Table is Empty</h4>
                      <p className="text-gray-400 text-sm max-w-[200px]">This table is currently available for walk-in customers.</p>
                    </div>
                  )}
                </div>

                {/* Panel Footer (Actions) */}
                <div className="p-6 border-t border-white/10 bg-white/5 mt-auto">
                  {selectedTable.isAvailable ? (
                    <Button 
                      variant="luxury" 
                      className="w-full bg-[var(--color-brand-accent)] text-white hover:bg-[var(--color-brand-accent-hover)]"
                      onClick={() => toggleTableStatus(selectedTable.id)}
                    >
                      Mark as Occupied
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      onClick={() => toggleTableStatus(selectedTable.id)}
                    >
                      Clear Table & Complete Order
                    </Button>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                  <span className="text-gray-500 text-2xl">?</span>
                </div>
                <h4 className="text-white font-medium mb-2">No Table Selected</h4>
                <p className="text-gray-400 text-sm">Select a table from the floor plan to view order details or update its status.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
