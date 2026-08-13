'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Circle, RectangleHorizontal, Sofa, Square, Clock, Users, Calendar, 
  CheckCircle2, AlertCircle, ShoppingBag, Sparkles, Utensils, Coffee, Box, Disc
} from 'lucide-react';
import { api, TableItem, LayoutObjectItem, LayoutVersion, TableShape, StaticObjectType, TableStatus } from '@/lib/api';

const SHAPE_ICONS: Record<TableShape, any> = {
  square: Square,
  rectangle: RectangleHorizontal,
  round: Circle,
  oval: Disc,
  bar_seat: Utensils,
  sofa: Sofa,
  private_room: Box,
};

const OBJECT_ICONS: Record<StaticObjectType, any> = {
  wall: Square,
  counter: RectangleHorizontal,
  cashier: Coffee,
  kitchen: Utensils,
  plant: Sparkles,
  window: Square,
  door: Box,
  decoration: Sparkles,
  waiting_area: Sofa,
  restroom: Users,
  divider: RectangleHorizontal,
  custom: Box,
};

const STATUS_COLORS: Record<TableStatus, { bg: string; border: string; text: string; label: string }> = {
  available: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', label: 'Available' },
  reserved: { bg: 'bg-[#E5A93C]/20', border: 'border-[#E5A93C]', text: 'text-[#F0BA53]', label: 'Reserved' },
  occupied: { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400', label: 'Occupied' },
  cleaning: { bg: 'bg-sky-500/20', border: 'border-sky-500', text: 'text-sky-400', label: 'Restoring' },
  out_of_service: { bg: 'bg-zinc-800/60', border: 'border-zinc-700', text: 'text-zinc-500', label: 'Unavailable' },
};

export function InteractiveFloorPlanMock({ onTableSelect }: { onTableSelect?: (tableId: string, tableName: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [layoutVersion, setLayoutVersion] = useState<LayoutVersion | null>(null);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [layoutObjects, setLayoutObjects] = useState<LayoutObjectItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isNormalizing, setIsNormalizing] = useState(true);

  // --- Responsive Scale & Viewport Calculation ---
  useEffect(() => {
    if (!layoutVersion || loading) return;
    const normalizeViewport = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // 1. Check if admin explicitly set a default viewport
        if (layoutVersion.defaultViewportZoom != null && layoutVersion.defaultViewportX != null && layoutVersion.defaultViewportY != null) {
          setScale(layoutVersion.defaultViewportZoom);
          setPan({ x: layoutVersion.defaultViewportX, y: layoutVersion.defaultViewportY });
          setIsNormalizing(false);
          return;
        }

        // 2. Fit-to-screen fallback
        if (tables.length === 0 && layoutObjects.length === 0) {
          setScale(1);
          setPan({ x: 0, y: 0 });
          setIsNormalizing(false);
          return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        tables.forEach(t => {
          if (t.x < minX) minX = t.x;
          if (t.y < minY) minY = t.y;
          if (t.x + t.width > maxX) maxX = t.x + t.width;
          if (t.y + t.height > maxY) maxY = t.y + t.height;
        });

        layoutObjects.forEach(o => {
          if (o.x < minX) minX = o.x;
          if (o.y < minY) minY = o.y;
          if (o.x + o.width > maxX) maxX = o.x + o.width;
          if (o.y + o.height > maxY) maxY = o.y + o.height;
        });

        // Add padding
        const padding = 100;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        // Calculate scale to fit container
        const scaleX = width / contentWidth;
        const scaleY = height / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 1.2); // Cap max scale

        // Calculate pan to center the content
        const scaledContentWidth = contentWidth * newScale;
        const scaledContentHeight = contentHeight * newScale;
        
        const newPanX = (width - scaledContentWidth) / 2 - (minX * newScale);
        const newPanY = (height - scaledContentHeight) / 2 - (minY * newScale);

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
        setIsNormalizing(false);
      }
    };
    normalizeViewport();
    window.addEventListener('resize', normalizeViewport);
    return () => window.removeEventListener('resize', normalizeViewport);
  }, [layoutVersion, tables, layoutObjects, loading]);

  // Fetch Live Canonical Layout
  const fetchLayout = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await api.floor.getLayout();
      setLayoutVersion(data.layoutVersion);
      setTables(data.tables);
      setLayoutObjects(data.layoutObjects);
    } catch (error) {
      console.error('Failed to load canonical floor plan:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayout();
    const interval = setInterval(() => fetchLayout(true), 5000);
    return () => clearInterval(interval);
  }, [fetchLayout]);

  const selectedTable = tables.find(t => t.id === selectedTableId);


  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-5 w-full min-h-[550px] text-[#FDFBF7] font-sans select-none">
      
      {/* Left Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#141210]/90 rounded-3xl border border-white/15 p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl min-h-[480px]"
      >
        <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          <h3 className="text-sm font-heading font-bold text-[#FFFFFF] tracking-tight flex items-center gap-2 drop-shadow-sm">
            Sanctuary Floor Geometry <span className="text-[10px] bg-[#E5A93C]/25 text-[#F0BA53] border border-[#E5A93C]/40 px-2 py-0.5 rounded font-sans font-bold shadow-sm">Live Sanctuary</span>
          </h3>
        </div>

        {/* Live Legend */}
        <div className="absolute top-4 right-6 z-10 hidden sm:flex items-center gap-3 bg-[#241E19]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-bold shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#F0BA53]">
            <span className="w-2 h-2 rounded-full bg-[#E5A93C] shadow-[0_0_8px_rgba(229,169,60,0.5)]" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            <span>Occupied</span>
          </div>
        </div>

        {loading && tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-[#C6C0B4] py-20">
            <div className="w-10 h-10 border-4 border-[#E5A93C] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-normal">Loading sanctuary seating geometry...</p>
          </div>
        ) : (
          /* Scaled Virtual Floor Plan Viewport */
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              opacity: isNormalizing ? 0 : 1,
            }}
            className="transition-all duration-300"
          >
            {/* Subtle background grid could be rendered here but this is infinite canvas */}

            {/* Decorative Static Objects */}
            {layoutObjects.map((obj) => {
              if (obj.isHidden) return null;
              const Icon = OBJECT_ICONS[obj.type] || Square;
              return (
                <div
                  key={obj.id}
                  style={{
                    left: `${obj.x}px`,
                    top: `${obj.y}px`,
                    width: `${obj.width}px`,
                    height: `${obj.height}px`,
                    transform: `rotate(${obj.rotation}deg)`,
                    zIndex: obj.zIndex,
                  }}
                  className="absolute pointer-events-none select-none rounded-xl bg-[#141210]/70 border border-white/10 flex flex-col items-center justify-center p-1 text-[#C6C0B4] backdrop-blur-sm"
                >
                  <Icon className="w-5 h-5 mb-0.5 opacity-60 text-[#E5A93C]" />
                  <span className="text-[10px] font-bold tracking-tight text-center truncate w-full px-1">{obj.name}</span>
                </div>
              );
            })}

            {/* Interactive Tables */}
            {tables.map((table) => {
              if (table.isHidden) return null;
              const isSelected = selectedTableId === table.id;
              const isAvailable = table.status === 'available';
              const Icon = SHAPE_ICONS[table.shape] || Circle;
              const statusStyle = STATUS_COLORS[table.status] || STATUS_COLORS.available;

              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  style={{
                    left: `${table.x}px`,
                    top: `${table.y}px`,
                    width: `${table.width}px`,
                    height: `${table.height}px`,
                    transform: `rotate(${table.rotation}deg)`,
                    zIndex: isSelected ? 50 : table.zIndex + 10,
                  }}
                  className={`absolute select-none transition-all duration-200 flex flex-col items-center justify-center p-2 border-2 cursor-pointer ${
                    table.shape === 'round' ? 'rounded-full' : table.shape === 'oval' ? 'rounded-[2.5rem]' : 'rounded-2xl'
                  } ${statusStyle.bg} ${statusStyle.border} ${
                    isSelected ? 'ring-4 ring-[#E5A93C] scale-110 shadow-[0_0_30px_rgba(229,169,60,0.5)] z-50 bg-[#241E19]/90' : 'hover:scale-[1.04] hover:shadow-lg'
                  } ${!isAvailable && !isSelected ? 'opacity-60 grayscale-[30%]' : ''}`}
                >
                  {/* Status Indicator Dot */}
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-[#141210] ${
                    isAvailable ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]' : table.status === 'occupied' ? 'bg-rose-500' : 'bg-[#E5A93C]'
                  }`} />

                  <Icon className={`w-6 h-6 mb-1 ${statusStyle.text}`} />
                  <span className="text-sm font-bold tracking-tight text-[#FFFFFF] drop-shadow truncate max-w-full px-1">{table.name}</span>
                  <span className="text-[10px] font-sans font-bold bg-[#141210]/95 text-[#ECE6DD] px-2 py-0.5 rounded-full mt-0.5 border border-white/15 shadow-sm">
                    {table.capacity} Guests
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-xs text-[#C6C0B4] text-center font-normal bg-[#141210]/80 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md whitespace-nowrap shadow-sm">
          Select any available table to reserve seating or order directly.
        </p>
      </div>

      {/* Right Details & Booking Panel (Clearer, Warmer Hotel Glassmorphism) */}
      <div className="w-full lg:w-96 bg-[#241E19]/65 border border-white/15 rounded-3xl p-6 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl shrink-0">
        {!selectedTable ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#C6C0B4] gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#141210]/80 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] animate-pulse shadow-md">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#FFFFFF] drop-shadow-sm">Select a Sanctuary Table</h3>
            <p className="text-xs text-[#ECE6DD] max-w-xs leading-relaxed font-normal">
              Explore our live sanctuary seating layout and choose an available table to book your reservation or start dine-in ordering.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            
            {/* Table Summary Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#F0BA53] shadow-sm">
                  {React.createElement(SHAPE_ICONS[selectedTable.shape] || Circle, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#FFFFFF] drop-shadow-sm">{selectedTable.name}</h2>
                  <span className="text-xs text-[#C6C0B4] font-sans capitalize font-medium">
                    {selectedTable.capacity} Guests • {selectedTable.shape.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border font-sans shadow-sm ${
                selectedTable.status === 'available' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {selectedTable.status === 'available' ? 'Available' : 'Unavailable'}
              </span>
            </div>

            {selectedTable.status !== 'available' ? (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 text-center my-auto space-y-3 shadow-inner">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="text-sm font-bold text-[#FFFFFF]">Table Currently Reserved</h4>
                <p className="text-xs text-[#ECE6DD] leading-relaxed font-normal">
                  This sanctuary table is currently marked as <span className="font-bold text-rose-300">{selectedTable.status.replace('_', ' ')}</span> in our live system.
                </p>
                <p className="text-xs text-[#C6C0B4] font-sans pt-1">
                  Please select another available table on the layout.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                
                  <div className="space-y-6 my-auto">
                    <div className="bg-[#141210]/80 p-4 rounded-2xl border border-white/15 space-y-3 text-xs shadow-sm">
                      <div className="flex justify-between text-[#C6C0B4]">
                        <span>Seating Capacity</span>
                        <span className="text-[#FFFFFF] font-bold">{selectedTable.capacity} Guests</span>
                      </div>
                      <div className="flex justify-between text-[#C6C0B4]">
                        <span>Table Geometry</span>
                        <span className="text-[#FFFFFF] font-bold capitalize">{selectedTable.shape.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-[#C6C0B4]">
                        <span>Sanctuary Ordering</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Table Service Enabled
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {onTableSelect ? (
                        <Button 
                          onClick={() => onTableSelect(selectedTable.id, selectedTable.name)}
                          className="w-full bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C] hover:opacity-95 text-[#141210] font-bold py-3.5 shadow-[0_0_25px_rgba(229,169,60,0.4)] gap-2 rounded-xl"
                        >
                          <ShoppingBag className="w-4 h-4 text-[#141210]" />
                          <span>Select Table {selectedTable.name}</span>
                        </Button>
                      ) : (
                        <Link href={`/menu?tableId=${selectedTable.id}&table=${encodeURIComponent(selectedTable.name)}`} className="block">
                          <Button className="w-full bg-gradient-to-r from-[#F0BA53] via-[#FFFFFF] to-[#E5A93C] hover:opacity-95 text-[#141210] font-bold py-3.5 shadow-[0_0_25px_rgba(229,169,60,0.4)] gap-2 rounded-xl">
                            <ShoppingBag className="w-4 h-4 text-[#141210]" />
                            <span>Order Menu for Table {selectedTable.name}</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
