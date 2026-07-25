import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Circle, RectangleHorizontal, Sofa, Square } from 'lucide-react';

export function InteractiveFloorPlanMock() {
  const [selectedTable, setSelectedTable] = React.useState<number | null>(null);

  const tables = [
    { id: 1, label: 'T1', type: 'round', capacity: 2, isAvailable: true, x: 25, y: 25 },
    { id: 2, label: 'T2', type: 'round', capacity: 2, isAvailable: false, x: 75, y: 25 },
    { id: 3, label: 'T3', type: 'rectangle', capacity: 4, isAvailable: true, x: 50, y: 50 },
    { id: 4, label: 'T4', type: 'rectangle', capacity: 4, isAvailable: true, x: 25, y: 75 },
    { id: 5, label: 'C1', type: 'couch', capacity: 6, isAvailable: true, x: 75, y: 75 },
    { id: 6, label: 'Bar', type: 'bar', capacity: 1, isAvailable: false, x: 50, y: 15 },
  ];

  const TABLE_ICONS: Record<string, import('lucide-react').LucideIcon> = {
    round: Circle,
    rectangle: RectangleHorizontal,
    couch: Sofa,
    bar: Square
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Canvas Area */}
      <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-8 relative min-h-[400px] shadow-inner overflow-hidden flex items-center justify-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {/* Table Mockup */}
        <div className="relative w-full max-w-lg aspect-square">
          {tables.map((table) => {
            const Icon = TABLE_ICONS[table.type];
            return (
              <button
                key={table.id}
                onClick={() => table.isAvailable && setSelectedTable(table.id)}
                disabled={!table.isAvailable}
                className={`
                  absolute p-3 rounded-xl transition-all duration-300 flex flex-col items-center justify-center
                  ${table.isAvailable
                    ? selectedTable === table.id 
                      ? 'bg-[var(--color-brand-accent)] text-white scale-110 shadow-lg shadow-black/20 z-20' 
                      : 'bg-white/5 border-[1.5px] border-white/10 text-white/70 hover:border-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)] shadow-sm backdrop-blur-sm z-10'
                    : 'bg-white/5 text-gray-500 border-[1.5px] border-white/5 cursor-not-allowed opacity-50 z-0'
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
                <span className="text-xs font-semibold">{table.label}</span>

                {!table.isAvailable && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details Panel */}
      <div className="w-full md:w-80 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col shadow-sm text-white">
        <h3 className="font-heading font-semibold text-xl mb-6">Booking Details</h3>
        
        {selectedTable ? (
          <div className="flex-1 flex flex-col">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">Selected Table</span>
                <span className="font-medium text-lg">{tables.find(t => t.id === selectedTable)?.label}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">Capacity</span>
                <span className="font-medium">{tables.find(t => t.id === selectedTable)?.capacity} Pax</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400 font-medium">Available</span>
              </div>
            </div>
            
            <div className="mt-auto">
              <p className="text-xs text-gray-400 mb-4 text-center">
                Select your preferred time slot on the next step.
              </p>
              <Link href={`/menu?table=${tables.find(t => t.id === selectedTable)?.label}`} className="block">
                <Button variant="luxury" className="w-full">
                  Continue Booking
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <span className="text-gray-500 text-2xl">?</span>
            </div>
            <p className="text-gray-400 text-sm">Select an available table from the floor plan to view details and proceed with booking.</p>
          </div>
        )}
      </div>
    </div>
  );
}
