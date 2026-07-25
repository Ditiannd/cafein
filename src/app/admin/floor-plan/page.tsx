'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter
} from '@dnd-kit/core';
import { 
  Circle, RectangleHorizontal, Sofa, Square, GripVertical, Trash2, Plus, QrCode, Download, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type TableType = 'round' | 'rectangle' | 'couch' | 'bar';

interface TableEntity {
  id: string;
  type: TableType;
  label: string;
  x: number | null; // null if in toolbox
  y: number | null;
}

const TABLE_ICONS = {
  round: Circle,
  rectangle: RectangleHorizontal,
  couch: Sofa,
  bar: Square,
};

// Draggable Table Component
function DraggableTable({ table, isOverlay }: { table: TableEntity; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    data: { table },
  });

  const Icon = TABLE_ICONS[table.type];

  const style = transform && !isOverlay ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  if (isDragging && !isOverlay) {
    return <div ref={setNodeRef} className="w-16 h-16 opacity-0" />;
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        w-16 h-16 flex flex-col items-center justify-center bg-background border-2 border-white/20 
        rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-[var(--color-brand-accent)]
        ${isOverlay ? 'shadow-xl scale-110 rotate-3 border-[var(--color-brand-accent)]' : ''}
      `}
    >
      <Icon strokeWidth={1} className="w-6 h-6 text-gray-300" />
      <span className="text-[10px] font-semibold text-gray-500 mt-1">{table.label}</span>
    </div>
  );
}

// Droppable Grid Cell Component
function DroppableCell({ id, x, y, children }: { id: string, x: number, y: number, children?: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { x, y },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        w-20 h-20 border border-white/10 flex items-center justify-center transition-colors
        ${isOver ? 'bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)]' : 'bg-background'}
      `}
    >
      {children}
    </div>
  );
}

// Droppable Toolbox (to remove tables from grid)
function Toolbox({ tables }: { tables: TableEntity[] }) {
  const { setNodeRef } = useDroppable({ id: 'toolbox' });
  const toolboxTables = tables.filter(t => t.x === null && t.y === null);

  return (
    <div className="w-64 bg-background border-r border-white/20 p-6 flex flex-col">
      <h2 className="font-heading font-semibold text-lg mb-6">Available Tables</h2>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        Drag tables onto the floor plan grid to arrange them. Drag back here to remove from the floor.
      </p>
      
      <div 
        ref={setNodeRef}
        className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 auto-rows-max p-2 min-h-[200px] border-2 border-dashed border-white/10 rounded-xl"
      >
        {toolboxTables.map(table => (
          <DraggableTable key={table.id} table={table} />
        ))}
        {toolboxTables.length === 0 && (
          <div className="col-span-2 flex items-center justify-center text-xs text-gray-400 h-24">
            Empty
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <Button variant="outline" className="w-full text-xs gap-2 bg-white/5">
          <Plus className="w-4 h-4" /> Create New Table
        </Button>
      </div>
    </div>
  );
}


export default function AdminFloorPlan() {
  const [tables, setTables] = useState<TableEntity[]>([
    { id: 't1', type: 'round', label: 'T1', x: 2, y: 3 },
    { id: 't2', type: 'round', label: 'T2', x: 5, y: 3 },
    { id: 't3', type: 'rectangle', label: 'T3', x: null, y: null },
    { id: 't4', type: 'rectangle', label: 'T4', x: null, y: null },
    { id: 'c1', type: 'couch', label: 'C1', x: null, y: null },
    { id: 'b1', type: 'bar', label: 'Bar 1', x: null, y: null },
  ]);

  const [activeTable, setActiveTable] = useState<TableEntity | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [downloadedQrs, setDownloadedQrs] = useState<string[]>([]);

  const GRID_SIZE = 8; // 8x8 grid

  const handleDownloadQr = (tableId: string) => {
    setDownloadedQrs(prev => [...prev, tableId]);
    setTimeout(() => {
      setDownloadedQrs(prev => prev.filter(id => id !== tableId));
    }, 2000);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const table = tables.find(t => t.id === active.id);
    if (table) setActiveTable(table);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTable(null);

    if (!over) return;

    if (over.id === 'toolbox') {
      // Move to toolbox
      setTables(prev => prev.map(t => t.id === active.id ? { ...t, x: null, y: null } : t));
      return;
    }

    const { x, y } = over.data.current as { x: number, y: number };

    // Check if cell is occupied by another table
    const isOccupied = tables.some(t => t.id !== active.id && t.x === x && t.y === y);
    if (isOccupied) return; // Prevent collision

    setTables(prev => prev.map(t => t.id === active.id ? { ...t, x, y } : t));
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white/5">
      <DndContext 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        {/* Left Sidebar Toolbox */}
        <Toolbox tables={tables} />

        {/* Main Canvas Area */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">Sandbox Floor Planner</h1>
              <p className="text-gray-500 mt-1">Design your layout and generate QR codes for walk-ins.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="text-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10 border-[var(--color-brand-accent)]/20 hover:bg-[var(--color-brand-accent)]/20" onClick={() => setShowQrModal(true)}>
                <QrCode className="w-4 h-4 mr-2" /> Generate QRs
              </Button>
              <Button variant="outline" className="text-red-600 bg-background hover:bg-red-50 border-red-200">
                <Trash2 className="w-4 h-4 mr-2" /> Clear Floor
              </Button>
              <Button variant="luxury">Save Layout</Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-white/10/50 rounded-3xl border border-white/20 overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div 
              className="bg-background shadow-xl rounded-xl p-8 border border-white/10 z-10"
            >
              <div 
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                  const x = index % GRID_SIZE;
                  const y = Math.floor(index / GRID_SIZE);
                  const cellId = `cell-${x}-${y}`;
                  
                  const tableInCell = tables.find(t => t.x === x && t.y === y);

                  return (
                    <DroppableCell key={cellId} id={cellId} x={x} y={y}>
                      {tableInCell && <DraggableTable table={tableInCell} />}
                    </DroppableCell>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeTable ? <DraggableTable table={activeTable} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* QR Generation Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="text-xl font-semibold">Table QR Codes</h2>
                  <p className="text-sm text-gray-400 mt-1">Download QR codes for tables currently placed on the floor.</p>
                </div>
                <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-6">
                {tables.filter(t => t.x !== null).map((table) => (
                  <div key={table.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-white/10 rounded-lg mb-3 flex items-center justify-center relative">
                      <QrCode className="w-12 h-12 text-gray-500" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-lg">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownloadQr(table.id)}
                          className={`${downloadedQrs.includes(table.id) ? 'bg-green-500 text-white' : 'bg-[var(--color-brand-accent)] text-black'} border-transparent`}
                        >
                          {downloadedQrs.includes(table.id) ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <span className="font-semibold text-white">{table.label}</span>
                    <span className="text-xs text-[var(--color-brand-accent)] mt-1 capitalize">{table.type}</span>
                  </div>
                ))}
                {tables.filter(t => t.x !== null).length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    No tables placed on the floor yet.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
