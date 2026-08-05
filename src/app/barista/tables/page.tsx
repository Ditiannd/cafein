'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RefreshCw, Circle, RectangleHorizontal, Sofa, Square, ShoppingBag, Clock, 
  CheckCircle2, Coffee, Utensils, Box, Disc, Users, AlertTriangle, Sparkles, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

const STATUS_COLORS: Record<TableStatus, { bg: string; border: string; text: string; label: string; badgeBg: string }> = {
  available: { bg: 'bg-emerald-500/15', border: 'border-emerald-500', text: 'text-emerald-400', label: 'Available', badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  reserved: { bg: 'bg-[#E5A93C]/15', border: 'border-[#E5A93C]', text: 'text-[#E5A93C]', label: 'Reserved', badgeBg: 'bg-[#E5A93C]/20 text-[#E5A93C] border-[#E5A93C]/40' },
  occupied: { bg: 'bg-rose-500/15', border: 'border-rose-500', text: 'text-rose-400', label: 'Occupied', badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
  cleaning: { bg: 'bg-sky-500/15', border: 'border-sky-500', text: 'text-sky-400', label: 'Cleaning', badgeBg: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
  out_of_service: { bg: 'bg-[#2B231D]/60', border: 'border-zinc-600', text: 'text-[#C6C0B4]', label: 'Out of Service', badgeBg: 'bg-[#2B231D] text-[#C6C0B4] border-[#E5A93C]/30' },
};

export default function BaristaTablesPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState<LayoutVersion | null>(null);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [layoutObjects, setLayoutObjects] = useState<LayoutObjectItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean }>({ isOpen: true });

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
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
        const newScale = Math.min(scaleX, scaleY, 1.5); // Cap max scale

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

  // --- Real-time Layout & Status Fetching ---
  const fetchLayoutAndStatus = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [layoutData, statusData] = await Promise.all([
        api.floor.getLayout(),
        api.store.getStatus().catch(() => ({ isOpen: true, announcementBanner: null })),
      ]);
      setLayoutVersion(layoutData.layoutVersion);
      setTables(layoutData.tables);
      setLayoutObjects(layoutData.layoutObjects);
      setStoreStatus({ isOpen: statusData.isOpen });
    } catch (error) {
      console.error('Error fetching layout:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayoutAndStatus();
    const interval = setInterval(() => {
      fetchLayoutAndStatus(true); // silent poll every 4s
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchLayoutAndStatus]);

  // --- Table Status Action ---
  const handleUpdateStatus = async (status: TableStatus, completeActiveOrders = false) => {
    if (!selectedTableId) return;
    try {
      setUpdating(true);
      await api.tables.updateStatus(selectedTableId, status, completeActiveOrders);
      await fetchLayoutAndStatus(true);
    } catch (error) {
      console.error('Failed to update table status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStoreStatus = async () => {
    try {
      const nextOpen = !storeStatus.isOpen;
      await api.store.setStatus({ isOpen: nextOpen });
      setStoreStatus({ isOpen: nextOpen });
    } catch (error) {
      console.error('Failed to toggle store status:', error);
    }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);

  if (loading && tables.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#141210] text-[#C6C0B4]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#E5A93C]" />
          <p className="text-sm font-medium">Synchronizing Canonical Floor Plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#141210] text-[#FFFFFF] overflow-hidden font-sans select-none">
      
      {/* Header Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#1E1A17]/90 border-b border-[#E5A93C]/20/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Spatial Table Operations <span className="text-xs px-2 py-0.5 rounded bg-[#E5A93C]/20 text-[#E5A93C] font-mono font-semibold">LIVE CANONICAL</span>
            </h1>
            <p className="text-xs text-[#C6C0B4]">Layout: <span className="text-[#FDFBF7] font-semibold">{layoutVersion?.name || 'Main Dining Room'}</span></p>
          </div>
        </div>

        {/* Live Legend Badges */}
        <div className="hidden md:flex items-center gap-3 bg-[#141210]/60 px-4 py-1.5 rounded-xl border border-[#E5A93C]/20 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available ({tables.filter(t => t.status === 'available').length})</span>
          </div>
          <div className="h-3 w-[1px] bg-[#2B231D]" />
          <div className="flex items-center gap-1.5 text-[#E5A93C]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Reserved ({tables.filter(t => t.status === 'reserved').length})</span>
          </div>
          <div className="h-3 w-[1px] bg-[#2B231D]" />
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Occupied ({tables.filter(t => t.status === 'occupied').length})</span>
          </div>
          <div className="h-3 w-[1px] bg-[#2B231D]" />
          <div className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Cleaning ({tables.filter(t => t.status === 'cleaning').length})</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLayoutAndStatus()}
            className="p-2 text-[#C6C0B4] hover:text-white rounded-lg hover:bg-[#2B231D] transition-colors"
            title="Refresh Layout"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Button
            onClick={handleToggleStoreStatus}
            variant={storeStatus.isOpen ? 'default' : 'outline'}
            size="sm"
            className={`gap-2 font-bold text-xs ${
              storeStatus.isOpen 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'border-rose-500/60 text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-[#141210]' : 'bg-rose-500'}`} />
            <span>Store: {storeStatus.isOpen ? 'OPEN FOR ORDERS' : 'CLOSED'}</span>
          </Button>
        </div>
      </header>

      {/* Workspace Body: Responsive Canvas Viewport + Right Details Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Responsive Canvas Container */}
        <main ref={containerRef} className="flex-1 bg-[#141210] relative overflow-hidden">
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
            {/* Subtle Grid Indicator could go here, but it's an infinite canvas now. We can leave it out or size it large. */}

            {/* Render Static Decorative architectural objects */}
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
                  className="absolute pointer-events-none select-none rounded-xl bg-[#1E1A17]/60 border border-[#E5A93C]/20/80 flex flex-col items-center justify-center p-1.5 text-zinc-600"
                >
                  <Icon className="w-5 h-5 mb-0.5 opacity-50" />
                  <span className="text-[10px] font-bold tracking-tight text-center truncate w-full px-1">{obj.name}</span>
                </div>
              );
            })}

            {/* Render Canonical Tables */}
            {tables.map((table) => {
              if (table.isHidden) return null;
              const isSelected = selectedTableId === table.id;
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
                    isSelected ? 'ring-4 ring-amber-500 scale-105 shadow-2xl z-50' : 'hover:scale-[1.03] hover:shadow-lg'
                  }`}
                >
                  {/* Status indicator dot */}
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-zinc-950 ${
                    table.status === 'available' ? 'bg-emerald-400' : table.status === 'occupied' ? 'bg-rose-500 animate-pulse' : table.status === 'reserved' ? 'bg-amber-400' : 'bg-sky-400'
                  }`} />

                  <Icon className={`w-6 h-6 mb-1 ${statusStyle.text}`} />
                  <span className="text-sm font-extrabold tracking-tight text-white drop-shadow truncate max-w-full px-1">{table.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-[#141210]/70 text-[#ECE6DD] px-2 py-0.5 rounded-full mt-0.5 border border-[#E5A93C]/30/40">
                    {table.capacity} Pax
                  </span>

                  {/* Order / Reservation Ticket Pill */}
                  {table.currentOrder && (
                    <span className="absolute -bottom-2.5 bg-rose-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-rose-400 animate-bounce">
                      #{table.currentOrder.orderNumber}
                    </span>
                  )}
                  {!table.currentOrder && table.currentReservation && (
                    <span className="absolute -bottom-2.5 bg-[#E5A93C] text-zinc-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md border border-[#E5A93C]">
                      Res • {table.currentReservation.customerName.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </main>

        {/* Right Sidebar: Table Operations & Live Ticket Details */}
        <aside className="w-96 bg-[#1E1A17]/95 border-l border-[#E5A93C]/20/90 flex flex-col z-10 shrink-0 shadow-2xl backdrop-blur-xl">
          {!selectedTable ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#C6C0B4] gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#2B231D]/50 border border-[#E5A93C]/30/50 flex items-center justify-center text-zinc-600">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-[#ECE6DD]">Select a Table</h3>
              <p className="text-xs text-[#C6C0B4] max-w-xs">Click any canonical table on the spatial floor layout to manage reservations, orders, and cleaning lifecycle states.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 custom-scrollbar">
              
              {/* Selected Table Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5A93C]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C]">
                    {React.createElement(SHAPE_ICONS[selectedTable.shape] || Circle, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{selectedTable.name}</h2>
                    <span className="text-xs text-[#C6C0B4] font-mono">
                      {selectedTable.capacity} Pax • {selectedTable.shape.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border font-mono uppercase ${STATUS_COLORS[selectedTable.status].badgeBg}`}>
                  {STATUS_COLORS[selectedTable.status].label}
                </span>
              </div>

              {/* Active Order Section */}
              {selectedTable.currentOrder ? (
                <div className="bg-gradient-to-br from-rose-950/50 to-zinc-900 p-5 rounded-2xl border border-rose-500/40 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-rose-400" />
                      <span className="text-sm font-bold text-white">Active Order Ticket</span>
                    </div>
                    <span className="text-sm font-mono font-extrabold bg-rose-500 text-white px-2.5 py-0.5 rounded-lg shadow">
                      #{selectedTable.currentOrder.orderNumber}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[#ECE6DD]">
                      <span>Order Status:</span>
                      <span className="font-semibold text-rose-300 capitalize">{selectedTable.currentOrder.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-[#ECE6DD]">
                      <span>Total Amount:</span>
                      <span className="font-mono font-bold text-white">Rp {selectedTable.currentOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#C6C0B4]">
                      <span>Ordered Time:</span>
                      <span>{new Date(selectedTable.currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Clear Table & Complete Order Button */}
                  <Button
                    onClick={() => handleUpdateStatus('cleaning', true)}
                    disabled={updating}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold py-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-2 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Order & Set Cleaning</span>
                  </Button>
                </div>
              ) : selectedTable.currentReservation ? (
                <div className="bg-gradient-to-br from-amber-950/40 to-zinc-900 p-5 rounded-2xl border border-[#E5A93C]/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5A93C]/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#E5A93C]" />
                      <span className="text-sm font-bold text-white">Upcoming Reservation</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#E5A93C]">
                      {new Date(selectedTable.currentReservation.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#ECE6DD]">
                    <p className="font-bold text-white text-sm">{selectedTable.currentReservation.customerName}</p>
                    <p className="text-[#C6C0B4]">{selectedTable.currentReservation.guestCount} Guests • Confirmed</p>
                    {selectedTable.currentReservation.customerPhone && (
                      <p className="font-mono text-[#E5A93C]">{selectedTable.currentReservation.customerPhone}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleUpdateStatus('occupied')}
                    disabled={updating}
                    className="w-full bg-[#E5A93C] hover:bg-amber-600 text-zinc-950 font-bold gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Seat Guest (Mark Occupied)</span>
                  </Button>
                </div>
              ) : (
                <div className="bg-[#141210]/60 p-5 rounded-2xl border border-[#E5A93C]/20/80 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Table is Available</h4>
                  <p className="text-xs text-[#C6C0B4]">No active orders or upcoming reservations attached to this table.</p>
                </div>
              )}

              {/* Staff Lifecycle Quick Actions */}
              <div className="space-y-3 mt-auto pt-6 border-t border-[#E5A93C]/20">
                <h4 className="text-xs font-bold text-[#C6C0B4] uppercase tracking-wider">Staff Status Overrides</h4>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={() => handleUpdateStatus('occupied')}
                    disabled={updating || selectedTable.status === 'occupied'}
                    variant="outline"
                    className="border-rose-500/40 hover:bg-rose-500/20 text-rose-300 text-xs font-bold justify-start gap-2 h-10"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Mark Occupied</span>
                  </Button>

                  <Button
                    onClick={() => handleUpdateStatus('cleaning')}
                    disabled={updating || selectedTable.status === 'cleaning'}
                    variant="outline"
                    className="border-sky-500/40 hover:bg-sky-500/20 text-sky-300 text-xs font-bold justify-start gap-2 h-10"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Mark Cleaning</span>
                  </Button>

                  <Button
                    onClick={() => handleUpdateStatus('available', true)}
                    disabled={updating || selectedTable.status === 'available'}
                    variant="outline"
                    className="border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold justify-start gap-2 h-10 col-span-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Set Available</span>
                  </Button>

                  <Button
                    onClick={() => handleUpdateStatus(selectedTable.status === 'out_of_service' ? 'available' : 'out_of_service')}
                    disabled={updating}
                    variant="outline"
                    className="border-[#E5A93C]/30 hover:bg-[#2B231D] text-[#C6C0B4] text-xs font-bold justify-start gap-2 h-10 col-span-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E5A93C]" />
                    <span>{selectedTable.status === 'out_of_service' ? 'Enable Table' : 'Out of Service'}</span>
                  </Button>
                </div>
              </div>

            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
