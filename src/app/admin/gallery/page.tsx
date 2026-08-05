'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Image as ImageIcon, Sparkles, Shield, ExternalLink, Camera } from 'lucide-react';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';

export default function GalleryManagementPage() {
  const { data: gallery = [], refetch } = useApiQuery('gallery', () => api.gallery.list());
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const handleAddImage = async () => {
    if (!newImageUrl) return;
    try {
      await api.gallery.create({ url: newImageUrl });
      setNewImageUrl('');
      refetch();
    } catch (err) {
      console.error('Failed to add image:', err);
    }
  };

  const handleRemoveImage = async (id: number) => {
    try {
      await api.gallery.delete(id);
      refetch();
    } catch (err) {
      console.error('Failed to remove image:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans select-none text-zinc-100">
      <div className="flex justify-between items-end mb-8 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Memory Gallery Vault</h1>
            <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">Visual Archive</span>
          </div>
          <p className="text-zinc-400 text-xs font-mono mt-1">Curate high-fidelity architectural and beverage imagery showcased on the landing page and Sanctuary grid.</p>
        </div>
        <div className="text-zinc-500 font-mono text-xs font-bold">
          Active Archives: <span className="text-amber-400">{gallery.length} Images</span>
        </div>
      </div>

      {/* Upload & Ingestion Container */}
      <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider">
          <Camera className="w-4 h-4" />
          <span>Ingest New Visual Artifact</span>
        </div>
        <h2 className="text-xl font-heading font-extrabold text-white mb-4">Add Image to Sanctuary Gallery</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 font-mono text-xs">
          <input 
            type="text" 
            placeholder="Paste high-res HTTPS URL (Unsplash, Cloudinary, AWS S3)..." 
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="input-luxury flex-1 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 shadow-inner"
          />
          <Button variant="luxury" onClick={handleAddImage} className="gap-2 px-8 py-3.5 font-bold shrink-0">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Deploy to Gallery Vault</span>
          </Button>
        </div>

        {newImageUrl && (
          <div className="mt-6 p-4 border border-amber-500/30 rounded-2xl bg-zinc-950/80 w-72 aspect-video relative overflow-hidden shadow-2xl">
            <div className="absolute top-2 left-2 z-10 bg-zinc-950/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold text-amber-300 border border-amber-500/40">
              ● LIVE PREVIEW
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={newImageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map(item => (
          <div key={item.id} className="card-luxury bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden aspect-[4/5] relative group shadow-lg transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="Gallery Artifact" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400 font-bold opacity-80 group-hover:opacity-100 transition-opacity">
              ID #{item.id}
            </div>

            <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 gap-3">
              <button 
                onClick={() => handleRemoveImage(item.id)}
                className="w-14 h-14 bg-rose-500/15 text-rose-400 border border-rose-500/40 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-zinc-950 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] font-bold group/btn"
                title="Permanently Expunge Image from Vault"
              >
                <Trash2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
              </button>
              <span className="text-[10px] font-mono text-rose-300 font-bold tracking-widest uppercase">Expunge Artifact</span>
            </div>
          </div>
        ))}

        {gallery.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3 bg-zinc-900/20 font-mono text-xs">
            <ImageIcon className="w-12 h-12 text-zinc-700 stroke-[1.5]" />
            <p className="font-bold text-zinc-500">Sanctuary Gallery Vault is Empty</p>
            <p className="text-[11px] text-zinc-600">Ingest high-resolution resort imagery above to populate the cinematic visual experience.</p>
          </div>
        )}
      </div>
    </div>
  );
}
