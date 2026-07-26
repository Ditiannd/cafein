'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Circle, RectangleHorizontal, Sofa, Square, Clock, Users, Calendar, 
  CheckCircle2, AlertCircle, ShoppingBag, Sparkles, Utensils, Coffee, Box, Disc, QrCode, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  reserved: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', label: 'Reserved' },
  occupied: { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400', label: 'Occupied' },
  cleaning: { bg: 'bg-sky-500/20', border: 'border-sky-500', text: 'text-sky-400', label: 'Cleaning' },
  out_of_service: { bg: 'bg-zinc-800/60', border: 'border-zinc-700', text: 'text-zinc-500', label: 'Unavailable' },
};

export function InteractiveFloorPlanMock() {
  const [loading, setLoading] = useState(true);
  const [layoutVersion, setLayoutVersion] = useState<LayoutVersion | null>(null);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [layoutObjects, setLayoutObjects] = useState<LayoutObjectItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Booking Form State
  const [activeMode, setActiveMode] = useState<'info' | 'book'>('info');
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('14:00');
  const [guestCount, setGuestCount] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<any | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  // Responsive Scaling
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const nextScale = Math.min(width / 1200, 1.1);
        setScale(Math.max(nextScale, 0.45));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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

  // When table selection changes, reset form default guests to table capacity
  useEffect(() => {
    if (selectedTable) {
      setGuestCount(Math.min(selectedTable.capacity, 10));
      setActiveMode('info');
      setErrorMsg(null);
    }
  }, [selectedTableId]);

  // --- Validate and Submit Booking ---
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    setErrorMsg(null);
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Please enter your phone number.');
      return;
    }

    // Business hours check: 08:00 to 22:00
    const [hours, minutes] = bookingTime.split(':').map(Number);
    if (hours < 8 || hours >= 22) {
      setErrorMsg('Reservations are only available during business hours (08:00 - 22:00).');
      return;
    }

    // Default duration 90 mins
    const reservationTimeISO = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();

    try {
      setSubmitting(true);
      const res = await api.reservations.create({
        tableId: selectedTable.id,
        customerName,
        customerPhone,
        customerEmail: `${customerPhone}@walkin.guest`,
        guestCount,
        reservationTime: reservationTimeISO,
        durationMinutes: 90,
        notes,
      });

      setConfirmedReservation({
        ...res,
        tableName: selectedTable.name,
      });
      await fetchLayout(true);
    } catch (err: any) {
      console.error('Reservation error:', err);
      setErrorMsg(err.message || 'This table is already booked for the selected time slot. Please choose another table or time.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full min-h-[550px] text-zinc-100 font-sans select-none">
      
      {/* Left Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-zinc-950/80 rounded-3xl border border-zinc-800/80 p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl min-h-[480px]"
      >
        <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            Canonical Table Layout <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">LIVE SYNC</span>
          </h3>
        </div>

        {/* Live Legend */}
        <div className="absolute top-4 right-6 z-10 hidden sm:flex items-center gap-3 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Occupied</span>
          </div>
        </div>

        {loading && tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-zinc-400 py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading live table layout...</p>
          </div>
        ) : (
          /* Scaled Virtual Floor Plan Viewport */
          <div
            style={{
              width: '1200px',
              height: '800px',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
            className="relative bg-zinc-900/30 border border-zinc-800/60 rounded-3xl overflow-hidden transition-all duration-300 shadow-inner my-auto"
          >
            {/* Subtle background grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

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
                  className="absolute pointer-events-none select-none rounded-xl bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center justify-center p-1 text-zinc-600"
                >
                  <Icon className="w-5 h-5 mb-0.5 opacity-40" />
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
                    isSelected ? 'ring-4 ring-amber-500 scale-110 shadow-[0_0_25px_rgba(245,158,11,0.4)] z-50' : 'hover:scale-[1.04] hover:shadow-lg'
                  } ${!isAvailable && !isSelected ? 'opacity-60 grayscale-[30%]' : ''}`}
                >
                  {/* Status Indicator Dot */}
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-zinc-950 ${
                    isAvailable ? 'bg-emerald-400 animate-pulse' : table.status === 'occupied' ? 'bg-rose-500' : 'bg-amber-400'
                  }`} />

                  <Icon className={`w-6 h-6 mb-1 ${statusStyle.text}`} />
                  <span className="text-sm font-extrabold tracking-tight text-white drop-shadow truncate max-w-full px-1">{table.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-zinc-950/80 text-zinc-300 px-2 py-0.5 rounded-full mt-0.5 border border-zinc-700/50">
                    {table.capacity} Pax
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-zinc-500 mt-4 text-center font-mono">
          Click any available table to reserve or order directly.
        </p>
      </div>

      {/* Right Details & Booking Panel */}
      <div className="w-full lg:w-96 bg-zinc-900/95 border border-zinc-800/90 rounded-3xl p-6 flex flex-col shadow-2xl backdrop-blur-xl shrink-0">
        {!selectedTable ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-600 animate-pulse">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">Select a Table</h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              Explore our live dining room floor plan and choose an available table to book your reservation or start dine-in ordering.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            
            {/* Table Summary Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {React.createElement(SHAPE_ICONS[selectedTable.shape] || Circle, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">{selectedTable.name}</h2>
                  <span className="text-xs text-zinc-400 font-mono capitalize">
                    {selectedTable.capacity} Pax • {selectedTable.shape.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border font-mono uppercase ${
                selectedTable.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}>
                {selectedTable.status === 'available' ? 'Available' : 'Unavailable'}
              </span>
            </div>

            {selectedTable.status !== 'available' ? (
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-5 text-center my-auto space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Table Currently Unavailable</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  This table is currently marked as <span className="font-semibold text-rose-300">{selectedTable.status.replace('_', ' ')}</span> by our staff or another guest reservation.
                </p>
                <p className="text-[11px] text-zinc-400 font-mono pt-1">
                  Please select another green table on the layout.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                
                {/* Action Mode Toggle */}
                <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 mb-5">
                  <button
                    onClick={() => setActiveMode('info')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeMode === 'info' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'}`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order Dine-In</span>
                  </button>
                  <button
                    onClick={() => setActiveMode('book')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeMode === 'book' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Table (90m)</span>
                  </button>
                </div>

                {activeMode === 'info' ? (
                  <div className="space-y-6 my-auto">
                    <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 space-y-3 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Seating Capacity</span>
                        <span className="text-white font-semibold">{selectedTable.capacity} Guests</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Table Geometry</span>
                        <span className="text-white font-semibold capitalize">{selectedTable.shape.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Direct Walk-in Ordering</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Instant QR Enabled
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link href={`/menu?tableId=${selectedTable.id}&table=${encodeURIComponent(selectedTable.name)}`} className="block">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-extrabold py-3.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          <span>Order Menu for Table {selectedTable.name}</span>
                        </Button>
                      </Link>
                      <button
                        onClick={() => setActiveMode('book')}
                        className="w-full py-2.5 text-xs text-zinc-400 hover:text-white font-semibold underline text-center transition-colors block"
                      >
                        Want to reserve this table in advance instead?
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Reservation Booking Form */
                  <form onSubmit={handleBookingSubmit} className="space-y-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-400 mb-1 block">Date</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-zinc-400 mb-1 block">Time (08:00 - 22:00)</label>
                        <input
                          type="time"
                          required
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 block">Number of Guests</label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {Array.from({ length: selectedTable.capacity }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Guest' : 'Guests'} {num === selectedTable.capacity ? '(Max Capacity)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 block">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Alexander Wright"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 block">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g., +62 812 3456 7890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 block">Special Requests (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="e.g., High chair needed, celebrating anniversary..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="mt-auto pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold py-3.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{submitting ? 'Confirming Booking...' : `Confirm 90-Min Reservation`}</span>
                      </Button>
                    </div>
                  </form>
                )}

              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">Reservation Confirmed!</h3>
                <p className="text-xs text-zinc-400 mt-1">Your 90-minute table reservation is officially locked in our system.</p>
              </div>

              <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 text-xs space-y-2.5 text-left">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Table:</span>
                  <span className="font-bold text-amber-400 text-sm">{confirmedReservation.tableName}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Guest Name:</span>
                  <span className="font-semibold text-white">{confirmedReservation.customerName}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Date & Time:</span>
                  <span className="font-mono font-semibold text-white">
                    {new Date(confirmedReservation.reservationTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Duration:</span>
                  <span className="font-mono text-emerald-400">90 Minutes (Standard)</span>
                </div>
              </div>

              <div className="w-36 h-36 bg-white rounded-xl p-2.5 mx-auto shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ resId: confirmedReservation.id, table: confirmedReservation.tableName }))}`}
                  alt="Reservation QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[11px] text-zinc-500 font-mono">
                Present this QR code to our host or barista upon arrival.
              </p>

              <Button
                onClick={() => setConfirmedReservation(null)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold py-3"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
