'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Circle, RectangleHorizontal, Sofa, Square, Trash2, Plus, QrCode, Download, X, Check,
  ZoomIn, ZoomOut, Maximize, RefreshCw, Layers, Lock, Unlock, Eye, EyeOff, RotateCw, Copy, 
  Grid, ShieldAlert, Sparkles, Folder, Save, Edit3, Settings, Coffee, Utensils, Users,
  ArrowUp, ArrowDown, HelpCircle, Printer, Move, Box, Disc
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

const STATUS_COLORS: Record<TableStatus, { bg: string; border: string; text: string; glow: string }> = {
  available: { bg: 'bg-emerald-500/15', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
  reserved: { bg: 'bg-amber-500/15', border: 'border-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
  occupied: { bg: 'bg-rose-500/15', border: 'border-rose-500', text: 'text-rose-400', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
  cleaning: { bg: 'bg-sky-500/15', border: 'border-sky-500', text: 'text-sky-400', glow: 'shadow-[0_0_15px_rgba(14,165,233,0.3)]' },
  out_of_service: { bg: 'bg-zinc-700/40', border: 'border-zinc-500', text: 'text-zinc-400', glow: 'shadow-none' },
};

export default function AdminFloorPlanPage() {
  // --- State ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState<LayoutVersion | null>(null);
  const [allVersions, setAllVersions] = useState<LayoutVersion[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [layoutObjects, setLayoutObjects] = useState<LayoutObjectItem[]>([]);

  // Canvas Viewport & Navigation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Snap Grid Settings
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSpacing, setGridSpacing] = useState(20);
  const [gridOpacity, setGridOpacity] = useState(0.15);
  const [collisionEnabled, setCollisionEnabled] = useState(true);

  // Selection & Inspector
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'table' | 'object' | null>(null);
  const [activeTab, setActiveTab] = useState<'toolbox' | 'inspector' | 'versions'>('toolbox');
  const [toolboxCategory, setToolboxCategory] = useState<'tables' | 'objects'>('tables');

  // Dragging & Resizing State
  const [draggingItem, setDraggingItem] = useState<{ id: string; type: 'table' | 'object'; startX: number; startY: number; mouseStartX: number; mouseStartY: number } | null>(null);
  const [resizingItem, setResizingItem] = useState<{ id: string; type: 'table' | 'object'; startWidth: number; startHeight: number; mouseStartX: number; mouseStartY: number } | null>(null);

  // Undo/Redo Stack
  const [history, setHistory] = useState<{ tables: TableItem[]; layoutObjects: LayoutObjectItem[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionAction, setNewVersionAction] = useState<'create' | 'duplicate'>('duplicate');

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Initial Data Load ---
  const fetchLayout = useCallback(async () => {
    try {
      setLoading(true);
      const [layoutData, versionsData] = await Promise.all([
        api.floor.getLayout(),
        api.layoutVersion.list(),
      ]);
      setLayoutVersion(layoutData.layoutVersion);
      setTables(layoutData.tables);
      setLayoutObjects(layoutData.layoutObjects);
      setAllVersions(versionsData);

      if (layoutData.layoutVersion?.canvasSettings) {
        try {
          const settings = JSON.parse(layoutData.layoutVersion.canvasSettings);
          if (settings.gridSpacing) setGridSpacing(settings.gridSpacing);
          if (settings.snapToGrid !== undefined) setSnapToGrid(settings.snapToGrid);
          if (settings.gridOpacity !== undefined) setGridOpacity(settings.gridOpacity);
        } catch (e) {
          console.error('Failed to parse canvas settings:', e);
        }
      }

      // Initialize history stack
      setHistory([{ tables: layoutData.tables, layoutObjects: layoutData.layoutObjects }]);
      setHistoryIndex(0);
    } catch (error) {
      console.error('Error loading floor layout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  // Push to undo/redo history
  const pushHistory = (newTables: TableItem[], newObjects: LayoutObjectItem[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push({ tables: JSON.parse(JSON.stringify(newTables)), layoutObjects: JSON.parse(JSON.stringify(newObjects)) });
    if (nextHistory.length > 25) nextHistory.shift(); // keep last 25 states
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTables(prev.tables);
      setLayoutObjects(prev.layoutObjects);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTables(next.tables);
      setLayoutObjects(next.layoutObjects);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // --- Save Changes ---
  const handleSaveLayout = async () => {
    try {
      setSaving(true);
      const canvasSettings = JSON.stringify({ gridSpacing, snapToGrid, gridOpacity });
      await api.floor.updateLayout({
        tables,
        layoutObjects,
        canvasSettings,
      });
      // Brief feedback
    } catch (error) {
      console.error('Failed to save layout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultViewport = async () => {
    try {
      setSaving(true);
      await api.floor.updateLayout({
        defaultViewportX: pan.x,
        defaultViewportY: pan.y,
        defaultViewportZoom: zoom,
      });
      alert('Default viewport saved successfully! This framing will be used in Customer and Barista views.');
    } catch (error) {
      console.error('Failed to save default viewport:', error);
      alert('Failed to save default viewport.');
    } finally {
      setSaving(false);
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' && !spacePressed) {
        setSpacePressed(true);
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
        e.preventDefault();
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        handleSaveLayout();
        e.preventDefault();
      }

      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedId && selectedType) {
          handleDeleteItem(selectedId, selectedType);
        }
      }

      // Arrow key nudging
      if (selectedId && selectedType && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : snapToGrid ? gridSpacing : 2;
        const dx = e.code === 'ArrowLeft' ? -delta : e.code === 'ArrowRight' ? delta : 0;
        const dy = e.code === 'ArrowUp' ? -delta : e.code === 'ArrowDown' ? delta : 0;

        if (selectedType === 'table') {
          const nextTables = tables.map(t => t.id === selectedId && !t.isLocked ? { ...t, x: t.x + dx, y: t.y + dy } : t);
          setTables(nextTables);
          pushHistory(nextTables, layoutObjects);
        } else {
          const nextObjs = layoutObjects.map(o => o.id === selectedId && !o.isLocked ? { ...o, x: o.x + dx, y: o.y + dy } : o);
          setLayoutObjects(nextObjs);
          pushHistory(tables, nextObjs);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed, selectedId, selectedType, tables, layoutObjects, historyIndex, snapToGrid, gridSpacing]);

  // --- Canvas Navigation ---
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(prev => Math.min(Math.max(0.4, prev * zoomFactor), 2.5));
    } else {
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    if (spacePressed || e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else {
      // Clicked blank space -> deselect
      if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'canvas-grid') {
        setSelectedId(null);
        setSelectedType(null);
      }
    }
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggingItem) {
      const dx = (e.clientX - draggingItem.mouseStartX) / zoom;
      const dy = (e.clientY - draggingItem.mouseStartY) / zoom;
      let nextX = draggingItem.startX + dx;
      let nextY = draggingItem.startY + dy;

      if (snapToGrid) {
        nextX = Math.round(nextX / gridSpacing) * gridSpacing;
        nextY = Math.round(nextY / gridSpacing) * gridSpacing;
      }

      if (draggingItem.type === 'table') {
        setTables(prev => prev.map(t => t.id === draggingItem.id ? { ...t, x: nextX, y: nextY } : t));
      } else {
        setLayoutObjects(prev => prev.map(o => o.id === draggingItem.id ? { ...o, x: nextX, y: nextY } : o));
      }
    } else if (resizingItem) {
      const dx = (e.clientX - resizingItem.mouseStartX) / zoom;
      const dy = (e.clientY - resizingItem.mouseStartY) / zoom;
      let nextW = Math.max(40, resizingItem.startWidth + dx);
      let nextH = Math.max(40, resizingItem.startHeight + dy);

      if (snapToGrid) {
        nextW = Math.round(nextW / gridSpacing) * gridSpacing;
        nextH = Math.round(nextH / gridSpacing) * gridSpacing;
      }

      if (resizingItem.type === 'table') {
        setTables(prev => prev.map(t => t.id === resizingItem.id ? { ...t, width: nextW, height: nextH } : t));
      } else {
        setLayoutObjects(prev => prev.map(o => o.id === resizingItem.id ? { ...o, width: nextW, height: nextH } : o));
      }
    }
  };

  const handlePointerUpCanvas = () => {
    if (isPanning) setIsPanning(false);
    if (draggingItem || resizingItem) {
      pushHistory(tables, layoutObjects);
      setDraggingItem(null);
      setResizingItem(null);
    }
  };

  // --- CRUD & Actions ---
  const handleCreateTable = async (shape: TableShape) => {
    try {
      const name = `T${tables.length + 1}`;
      const capacity = shape === 'sofa' || shape === 'private_room' ? 6 : shape === 'rectangle' ? 4 : shape === 'bar_seat' ? 1 : 2;
      const width = shape === 'sofa' ? 140 : shape === 'rectangle' ? 120 : 80;
      const height = shape === 'sofa' ? 90 : shape === 'rectangle' ? 80 : 80;
      
      // Center of viewport
      const x = snapToGrid ? Math.round(500 / gridSpacing) * gridSpacing : 500;
      const y = snapToGrid ? Math.round(400 / gridSpacing) * gridSpacing : 400;

      const newTable = await api.tables.create({
        name,
        shape,
        capacity,
        x,
        y,
        width,
        height,
        status: 'available',
      });

      const nextTables = [...tables, newTable];
      setTables(nextTables);
      pushHistory(nextTables, layoutObjects);
      setSelectedId(newTable.id);
      setSelectedType('table');
      setActiveTab('inspector');
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  const handleCreateObject = (type: StaticObjectType) => {
    const newObj: LayoutObjectItem = {
      id: `obj_${Date.now()}`,
      layoutVersionId: layoutVersion?.id || '',
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      x: snapToGrid ? Math.round(450 / gridSpacing) * gridSpacing : 450,
      y: snapToGrid ? Math.round(350 / gridSpacing) * gridSpacing : 350,
      width: type === 'wall' || type === 'divider' ? 200 : 100,
      height: type === 'wall' || type === 'divider' ? 20 : 100,
      rotation: 0,
      scale: 1,
      zIndex: 1,
      isLocked: false,
      isHidden: false,
    };

    const nextObjs = [...layoutObjects, newObj];
    setLayoutObjects(nextObjs);
    pushHistory(tables, nextObjs);
    setSelectedId(newObj.id);
    setSelectedType('object');
    setActiveTab('inspector');
  };

  const handleDeleteItem = async (id: string, type: 'table' | 'object') => {
    if (type === 'table') {
      try {
        await api.tables.delete(id);
        const nextTables = tables.filter(t => t.id !== id);
        setTables(nextTables);
        pushHistory(nextTables, layoutObjects);
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    } else {
      const nextObjs = layoutObjects.filter(o => o.id !== id);
      setLayoutObjects(nextObjs);
      pushHistory(tables, nextObjs);
    }
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
  };

  const handleDuplicateItem = async (id: string, type: 'table' | 'object') => {
    if (type === 'table') {
      const source = tables.find(t => t.id === id);
      if (!source) return;
      try {
        const dup = await api.tables.create({
          name: `${source.name} (Copy)`,
          shape: source.shape,
          capacity: source.capacity,
          x: source.x + gridSpacing * 2,
          y: source.y + gridSpacing * 2,
          width: source.width,
          height: source.height,
          rotation: source.rotation,
          status: 'available',
        });
        const nextTables = [...tables, dup];
        setTables(nextTables);
        pushHistory(nextTables, layoutObjects);
        setSelectedId(dup.id);
      } catch (error) {
        console.error('Failed to duplicate table:', error);
      }
    } else {
      const source = layoutObjects.find(o => o.id === id);
      if (!source) return;
      const dup: LayoutObjectItem = {
        ...source,
        id: `obj_${Date.now()}`,
        name: `${source.name} (Copy)`,
        x: source.x + gridSpacing * 2,
        y: source.y + gridSpacing * 2,
      };
      const nextObjs = [...layoutObjects, dup];
      setLayoutObjects(nextObjs);
      pushHistory(tables, nextObjs);
      setSelectedId(dup.id);
    }
  };

  const handleRotateItem = (id: string, type: 'table' | 'object', angle: number = 90) => {
    if (type === 'table') {
      const nextTables = tables.map(t => t.id === id ? { ...t, rotation: (t.rotation + angle) % 360 } : t);
      setTables(nextTables);
      pushHistory(nextTables, layoutObjects);
    } else {
      const nextObjs = layoutObjects.map(o => o.id === id ? { ...o, rotation: (o.rotation + angle) % 360 } : o);
      setLayoutObjects(nextObjs);
      pushHistory(tables, nextObjs);
    }
  };

  // --- Versioning Actions ---
  const handleSwitchVersion = async (versionId: string) => {
    try {
      setLoading(true);
      await api.layoutVersion.switch(versionId);
      await fetchLayout();
    } catch (error) {
      console.error('Failed to switch version:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersionSubmit = async () => {
    if (!newVersionName.trim()) return;
    try {
      setLoading(true);
      await api.layoutVersion.create({
        name: newVersionName,
        action: newVersionAction,
        sourceVersionId: layoutVersion?.id,
      });
      setShowNewVersionModal(false);
      setNewVersionName('');
      await fetchLayout();
    } catch (error) {
      console.error('Failed to create layout version:', error);
    } finally {
      setLoading(false);
    }
  };

  // Selected item reference for inspector
  const selectedItem = selectedType === 'table' 
    ? tables.find(t => t.id === selectedId) 
    : layoutObjects.find(o => o.id === selectedId);

  if (loading && !layoutVersion) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Loading Sandbox Floor Planner v2...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      
      {/* Top Bar: Canvas Controls & Actions */}
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Sandbox Floor Planner <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">v2.0 CANONICAL</span>
            </h1>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 mx-2" />

          {/* Version dropdown summary */}
          <div className="flex items-center gap-2 bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-zinc-700/50">
            <Folder className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-200">{layoutVersion?.name || 'Main Dining Room'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">Active</span>
          </div>
        </div>

        {/* Viewport Zoom & Grid Controls */}
        <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
          <button 
            onClick={() => setSnapToGrid(!snapToGrid)} 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${snapToGrid ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-zinc-400 hover:bg-zinc-800'}`}
            title="Toggle Snap to Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Snap {snapToGrid ? 'ON' : 'OFF'}</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-12 text-center text-zinc-300 font-semibold">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Reset Viewport">
            <Maximize className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
          <button onClick={handleSetDefaultViewport} disabled={saving} className="flex items-center gap-1.5 px-2.5 py-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors text-xs font-medium" title="Save this camera view as default for Customer/Barista">
            <Eye className="w-3.5 h-3.5" />
            <span>Set Default View</span>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-800/40 p-1 rounded-lg border border-zinc-800">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0} 
              className="px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 rounded transition-colors"
              title="Undo (Ctrl+Z)"
            >
              Undo
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1} 
              className="px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 rounded transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              Redo
            </button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowQrModal(true)}
            className="border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 gap-1.5 font-medium shadow-sm"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Codes</span>
          </Button>

          <Button 
            onClick={handleSaveLayout} 
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold gap-2 px-5 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all transform active:scale-95"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Layout'}</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Area: Left Sidebar + Infinite Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar: Toolbox / Inspector / Versions */}
        <aside className="w-80 bg-zinc-900/95 border-r border-zinc-800/90 flex flex-col z-10 shrink-0 shadow-2xl backdrop-blur-xl">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-800/80 p-1.5 gap-1 bg-zinc-950/40">
            <button
              onClick={() => setActiveTab('toolbox')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeTab === 'toolbox' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Toolbox</span>
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeTab === 'inspector' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeTab === 'versions' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Versions</span>
            </button>
          </div>

          {/* Tab 1: Toolbox */}
          {activeTab === 'toolbox' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
              
              {/* Category sub-switch */}
              <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/60">
                <button
                  onClick={() => setToolboxCategory('tables')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${toolboxCategory === 'tables' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'}`}
                >
                  Tables (7 Shapes)
                </button>
                <button
                  onClick={() => setToolboxCategory('objects')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${toolboxCategory === 'objects' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'}`}
                >
                  Static Objects
                </button>
              </div>

              {toolboxCategory === 'tables' ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-zinc-400 px-1">Click to drop onto the center canvas:</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['round', 'rectangle', 'square', 'oval', 'sofa', 'bar_seat', 'private_room'] as TableShape[]).map((shape) => {
                      const Icon = SHAPE_ICONS[shape];
                      return (
                        <button
                          key={shape}
                          onClick={() => handleCreateTable(shape)}
                          className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-amber-500/50 transition-all group shadow-sm hover:shadow-md"
                        >
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-zinc-800 text-amber-400">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-zinc-200 capitalize">{shape.replace('_', ' ')}</span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {shape === 'sofa' || shape === 'private_room' ? '6 Pax' : shape === 'rectangle' ? '4 Pax' : shape === 'bar_seat' ? '1 Pax' : '2 Pax'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-zinc-400 px-1">Decorative architectural objects:</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['wall', 'counter', 'cashier', 'kitchen', 'plant', 'window', 'door', 'decoration', 'waiting_area', 'restroom', 'divider', 'custom'] as StaticObjectType[]).map((type) => {
                      const Icon = OBJECT_ICONS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => handleCreateObject(type)}
                          className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-500 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform text-zinc-300">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-medium text-zinc-300 capitalize">{type.replace('_', ' ')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grid & Canvas Configuration Drawer */}
              <div className="mt-auto pt-6 border-t border-zinc-800/80 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Grid Settings</span>
                </h4>
                
                <div className="space-y-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium">Grid Spacing</span>
                    <select
                      value={gridSpacing}
                      onChange={(e) => setGridSpacing(Number(e.target.value))}
                      className="bg-zinc-900 text-zinc-200 border border-zinc-700 rounded px-2 py-1 font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value={10}>10 px (Fine)</option>
                      <option value={20}>20 px (Standard)</option>
                      <option value={40}>40 px (Coarse)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium">Grid Opacity</span>
                    <input
                      type="range"
                      min="0.05"
                      max="0.4"
                      step="0.05"
                      value={gridOpacity}
                      onChange={(e) => setGridOpacity(Number(e.target.value))}
                      className="w-24 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Property Inspector */}
          {activeTab === 'inspector' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scrollbar">
              {!selectedItem ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 gap-2">
                  <Box className="w-10 h-10 stroke-1 text-zinc-700 animate-bounce" />
                  <p className="text-sm font-medium">No object selected</p>
                  <p className="text-xs text-zinc-600">Click any table or static object on the canvas to inspect and edit its live properties.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Item Header */}
                  <div className="flex items-center justify-between bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        {selectedType === 'table' ? (
                          React.createElement(SHAPE_ICONS[(selectedItem as TableItem).shape] || Circle, { className: "w-5 h-5" })
                        ) : (
                          React.createElement(OBJECT_ICONS[(selectedItem as LayoutObjectItem).type] || Square, { className: "w-5 h-5" })
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{selectedItem.name}</h3>
                        <span className="text-[10px] font-mono uppercase bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                          {selectedType === 'table' ? `Table • ${(selectedItem as TableItem).shape}` : `Object • ${(selectedItem as LayoutObjectItem).type}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (selectedType === 'table') {
                            setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, isLocked: !t.isLocked } : t));
                          } else {
                            setLayoutObjects(prev => prev.map(o => o.id === selectedItem.id ? { ...o, isLocked: !o.isLocked } : o));
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${selectedItem.isLocked ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                        title="Lock Position"
                      >
                        {selectedItem.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(selectedItem.id, selectedType!)}
                        className="p-1.5 rounded-lg border border-zinc-800 text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Object"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 block">Label / Name</label>
                      <input
                        type="text"
                        value={selectedItem.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedType === 'table') {
                            setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, name: val } : t));
                          } else {
                            setLayoutObjects(prev => prev.map(o => o.id === selectedItem.id ? { ...o, name: val } : o));
                          }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    {selectedType === 'table' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1 block">Capacity (Pax)</label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={(selectedItem as TableItem).capacity}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 1;
                              setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, capacity: val } : t));
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1 block">Operational Status</label>
                          <select
                            value={(selectedItem as TableItem).status}
                            onChange={(e) => {
                              const val = e.target.value as TableStatus;
                              setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, status: val } : t));
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-2 text-xs text-white capitalize focus:outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="available">Available</option>
                            <option value="reserved">Reserved</option>
                            <option value="occupied">Occupied</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="out_of_service">Out of Service</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Spatial Coordinates & Dimensions */}
                    <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-2.5">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Spatial Coordinates & Size</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 font-mono w-4">X:</span>
                          <input
                            type="number"
                            value={Math.round(selectedItem.x)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (selectedType === 'table') setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, x: val } : t));
                              else setLayoutObjects(prev => prev.map(o => o.id === selectedItem.id ? { ...o, x: val } : o));
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-200"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 font-mono w-4">Y:</span>
                          <input
                            type="number"
                            value={Math.round(selectedItem.y)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (selectedType === 'table') setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, y: val } : t));
                              else setLayoutObjects(prev => prev.map(o => o.id === selectedItem.id ? { ...o, y: val } : o));
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-200"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 font-mono w-4">W:</span>
                          <input
                            type="number"
                            value={Math.round(selectedItem.width)}
                            onChange={(e) => {
                              const val = Math.max(40, Number(e.target.value));
                              if (selectedType === 'table') setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, width: val } : t));
                              else setLayoutObjects(prev => prev.map(o => o.id === selectedItem.id ? { ...o, width: val } : o));
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-200"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 font-mono w-4">H:</span>
                          <input
                            type="number"
                            value={Math.round(selectedItem.height)}
                            onChange={(e) => {
                              const val = Math.max(40, Number(e.target.value));
                              if (selectedType === 'table') setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, height: val } : t));
                              else setLayoutObjects(prev => prev.map(o => o.id === selectedItem.id ? { ...o, height: val } : o));
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-200"
                          />
                        </div>
                      </div>

                      {/* Rotation Controls */}
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                        <span className="text-xs text-zinc-400">Rotation ({selectedItem.rotation}°)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRotateItem(selectedItem.id, selectedType!, 90)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded flex items-center gap-1 text-amber-400 transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>+90°</span>
                          </button>
                          <button
                            onClick={() => handleRotateItem(selectedItem.id, selectedType!, 45)}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded text-zinc-300 font-mono"
                          >
                            +45°
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes & Actions */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1 block">Notes / Special Instructions</label>
                      <textarea
                        rows={2}
                        value={(selectedItem as any).notes || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedType === 'table') {
                            setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, notes: val } : t));
                          }
                        }}
                        placeholder="e.g., Near window, VIP table..."
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    {/* Action buttons for item */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateItem(selectedItem.id, selectedType!)}
                        className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 gap-1.5 text-xs font-semibold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </Button>
                      {selectedType === 'table' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const updated = await api.tables.regenerateQr(selectedItem.id);
                              setTables(prev => prev.map(t => t.id === selectedItem.id ? { ...t, qrCode: updated.qrCode } : t));
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-amber-400 gap-1.5 text-xs font-semibold"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset QR</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Live Order or Reservation Card if occupied */}
                  {selectedType === 'table' && (selectedItem as TableItem).currentOrder && (
                    <div className="bg-gradient-to-br from-rose-950/40 to-zinc-900 p-3.5 rounded-xl border border-rose-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Active Order #{(selectedItem as TableItem).currentOrder!.orderNumber}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Rp {(selectedItem as TableItem).currentOrder!.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Status: <span className="text-zinc-200 font-semibold capitalize">{(selectedItem as TableItem).currentOrder!.status.replace('_', ' ')}</span> • {(selectedItem as TableItem).currentOrder!.itemsCount || 1} Items
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Versions */}
          {activeTab === 'versions' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Layout Versions</span>
                <Button
                  size="sm"
                  onClick={() => { setNewVersionName(''); setShowNewVersionModal(true); }}
                  className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold h-7 px-2.5 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Version</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {allVersions.map((ver) => {
                  const isCurrent = ver.id === layoutVersion?.id;
                  return (
                    <div
                      key={ver.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${isCurrent ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{ver.name}</h4>
                          {ver.isActive && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                              ACTIVE CANONICAL
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Created {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitchVersion(ver.id)}
                          className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs h-7 px-3 font-semibold"
                        >
                          Switch
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
            <span>Space+Drag: Pan</span>
            <span>Ctrl+Z: Undo</span>
          </div>
        </aside>

        {/* Center: Infinite Canvas Viewport */}
        <main 
          ref={canvasRef}
          onWheel={handleWheel}
          onPointerDown={handlePointerDownCanvas}
          onPointerMove={handlePointerMoveCanvas}
          onPointerUp={handlePointerUpCanvas}
          className={`flex-1 bg-zinc-950 relative overflow-hidden flex items-center justify-center ${isPanning || spacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        >
          {/* Snap Grid Background Overlay */}
          <div 
            id="canvas-grid"
            className="absolute inset-0 pointer-events-auto"
            style={{
              backgroundImage: snapToGrid 
                ? `radial-gradient(circle, rgba(255, 255, 255, ${gridOpacity}) 1px, transparent 1px)` 
                : 'none',
              backgroundSize: `${gridSpacing * zoom}px ${gridSpacing * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />

          {/* Virtual Canvas Container (Scaled & Panned) */}
          <div
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '1200px',
              height: '800px',
            }}
            className="absolute top-0 left-0 pointer-events-none transition-transform duration-75 ease-out"
          >
            {/* Canvas Border Indicator (Optional Reference Box) */}
            <div className="absolute inset-0 border border-zinc-800/40 rounded-3xl pointer-events-none" />

            {/* Render Static Decorative Objects First (Lower zIndex) */}
            {layoutObjects.map((obj) => {
              const isSelected = selectedId === obj.id && selectedType === 'object';
              const Icon = OBJECT_ICONS[obj.type] || Square;

              return (
                <div
                  key={obj.id}
                  onPointerDown={(e) => {
                    if (spacePressed || obj.isLocked) return;
                    e.stopPropagation();
                    setSelectedId(obj.id);
                    setSelectedType('object');
                    setActiveTab('inspector');
                    setDraggingItem({ id: obj.id, type: 'object', startX: obj.x, startY: obj.y, mouseStartX: e.clientX, mouseStartY: e.clientY });
                  }}
                  style={{
                    left: `${obj.x}px`,
                    top: `${obj.y}px`,
                    width: `${obj.width}px`,
                    height: `${obj.height}px`,
                    transform: `rotate(${obj.rotation}deg)`,
                    zIndex: isSelected ? 50 : obj.zIndex,
                  }}
                  className={`absolute pointer-events-auto select-none rounded-xl transition-shadow duration-150 flex flex-col items-center justify-center p-2 border ${
                    isSelected ? 'ring-2 ring-amber-500 border-amber-500 bg-zinc-800/80 shadow-2xl' : 'border-zinc-800/60 bg-zinc-900/40 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1 opacity-70" />
                  <span className="text-[11px] font-bold tracking-tight text-center truncate w-full px-1">{obj.name}</span>

                  {/* Resizing Handle on Bottom Right */}
                  {isSelected && !obj.isLocked && (
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setResizingItem({ id: obj.id, type: 'object', startWidth: obj.width, startHeight: obj.height, mouseStartX: e.clientX, mouseStartY: e.clientY });
                      }}
                      className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-zinc-950 cursor-se-resize hover:scale-125 transition-transform shadow-md"
                    />
                  )}
                </div>
              );
            })}

            {/* Render Tables (Canonical Table Entities) */}
            {tables.map((table) => {
              if (table.isHidden) return null;
              const isSelected = selectedId === table.id && selectedType === 'table';
              const Icon = SHAPE_ICONS[table.shape] || Circle;
              const statusStyle = STATUS_COLORS[table.status] || STATUS_COLORS.available;

              return (
                <div
                  key={table.id}
                  onPointerDown={(e) => {
                    if (spacePressed || table.isLocked) return;
                    e.stopPropagation();
                    setSelectedId(table.id);
                    setSelectedType('table');
                    setActiveTab('inspector');
                    setDraggingItem({ id: table.id, type: 'table', startX: table.x, startY: table.y, mouseStartX: e.clientX, mouseStartY: e.clientY });
                  }}
                  style={{
                    left: `${table.x}px`,
                    top: `${table.y}px`,
                    width: `${table.width}px`,
                    height: `${table.height}px`,
                    transform: `rotate(${table.rotation}deg)`,
                    zIndex: isSelected ? 100 : table.zIndex + 10,
                  }}
                  className={`absolute pointer-events-auto select-none transition-all duration-150 flex flex-col items-center justify-center p-2.5 border-2 ${
                    table.shape === 'round' ? 'rounded-full' : table.shape === 'oval' ? 'rounded-[3rem]' : 'rounded-2xl'
                  } ${statusStyle.bg} ${statusStyle.border} ${statusStyle.glow} ${
                    isSelected ? 'ring-4 ring-amber-500/80 scale-105 shadow-2xl' : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-zinc-950 ${
                    table.status === 'available' ? 'bg-emerald-400 animate-pulse' : table.status === 'occupied' ? 'bg-rose-500' : table.status === 'reserved' ? 'bg-amber-400' : 'bg-sky-400'
                  }`} />

                  {/* Table Shape Icon & Name */}
                  <Icon className={`w-6 h-6 mb-1 ${statusStyle.text}`} />
                  <span className="text-sm font-extrabold tracking-tight text-white drop-shadow-md truncate max-w-full px-1">{table.name}</span>
                  
                  {/* Capacity Pax Badge */}
                  <span className="text-[10px] font-mono font-bold bg-zinc-950/70 text-zinc-300 px-2 py-0.5 rounded-full mt-0.5 border border-zinc-700/50">
                    {table.capacity} Pax
                  </span>

                  {/* Active Order Ticket Badge if occupied */}
                  {table.currentOrder && (
                    <span className="absolute -bottom-2 bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-bounce">
                      #{table.currentOrder.orderNumber}
                    </span>
                  )}

                  {/* Resizing Handle */}
                  {isSelected && !table.isLocked && (
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setResizingItem({ id: table.id, type: 'table', startWidth: table.width, startHeight: table.height, mouseStartX: e.clientX, mouseStartY: e.clientY });
                      }}
                      className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-zinc-950 cursor-se-resize hover:scale-125 transition-transform shadow-md"
                    />
                  )}
                </div>
              );
            })}

          </div>

          {/* Floating Live Legend Panel (Bottom Right) */}
          <div className="absolute bottom-6 right-6 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-3.5 backdrop-blur-md shadow-2xl flex items-center gap-5 z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">Available ({tables.filter(t => t.status === 'available').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-semibold text-zinc-300">Occupied ({tables.filter(t => t.status === 'occupied').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-zinc-300">Reserved ({tables.filter(t => t.status === 'reserved').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-xs font-semibold text-zinc-300">Cleaning ({tables.filter(t => t.status === 'cleaning').length})</span>
            </div>
          </div>
        </main>
      </div>

      {/* QR Code Management Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Canonical Table QR Codes</h3>
                    <p className="text-xs text-zinc-400">Scan to launch customer walk-in ordering tied directly to this canonical table.</p>
                  </div>
                </div>
                <button onClick={() => setShowQrModal(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4 custom-scrollbar">
                {tables.map((table) => {
                  const orderingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/menu?tableId=${table.id}&table=${encodeURIComponent(table.name)}`;
                  return (
                    <div key={table.id} className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 flex flex-col items-center text-center group hover:border-amber-500/50 transition-all">
                      <div className="w-32 h-32 bg-white rounded-xl p-2 mb-3 flex items-center justify-center shadow-inner">
                        {/* QR Code Placeholder / Real Render */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(orderingUrl)}`} 
                          alt={`QR for ${table.name}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-white">{table.name}</h4>
                      <span className="text-[11px] text-zinc-400 font-mono mb-3">{table.capacity} Pax • {table.shape.replace('_', ' ')}</span>

                      <div className="flex items-center gap-2 w-full mt-auto">
                        <a
                          href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(orderingUrl)}`}
                          download={`QRCode_${table.name}.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-zinc-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PNG</span>
                        </a>
                        <button
                          onClick={() => window.open(orderingUrl, '_blank')}
                          className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold transition-colors"
                          title="Test Walk-in URL"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => window.print()} className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 gap-1.5 font-semibold text-xs">
                  <Printer className="w-4 h-4" />
                  <span>Print All QR Cards</span>
                </Button>
                <Button onClick={() => setShowQrModal(false)} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6">
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Layout Version Modal */}
      <AnimatePresence>
        {showNewVersionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-amber-400" />
                  <span>Create Layout Version</span>
                </h3>
                <button onClick={() => setShowNewVersionModal(false)} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-1 block">Version Name</label>
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="e.g., Weekend Patio Setup, Evening Fine Dining..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Creation Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewVersionAction('duplicate')}
                      className={`p-3 rounded-xl border text-left transition-all ${newVersionAction === 'duplicate' ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Duplicate Current</span>
                      <span className="text-[11px] text-zinc-500 leading-tight block">Copy all tables and objects from active layout.</span>
                    </button>
                    <button
                      onClick={() => setNewVersionAction('create')}
                      className={`p-3 rounded-xl border text-left transition-all ${newVersionAction === 'create' ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Blank Canvas</span>
                      <span className="text-[11px] text-zinc-500 leading-tight block">Start from scratch with an empty floor.</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowNewVersionModal(false)} className="border-zinc-700 bg-zinc-800 text-zinc-300">
                  Cancel
                </Button>
                <Button onClick={handleCreateVersionSubmit} disabled={!newVersionName.trim()} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-5">
                  Create Version
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
