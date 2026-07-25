'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
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
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-white">Gallery Management</h1>
          <p className="text-[var(--color-brand-muted)] mt-2">Manage the images displayed in the Closed Mode cinematic gallery.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-heading font-semibold text-white mb-4">Add New Image</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Paste Unsplash or Image URL here..." 
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 bg-background border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:border-[var(--color-brand-accent)]"
          />
          <Button onClick={handleAddImage} className="gap-2">
            <Plus className="w-4 h-4" /> Add to Gallery
          </Button>
        </div>
        {newImageUrl && (
          <div className="mt-4 p-4 border border-white/10 rounded-lg bg-background w-64 aspect-video relative overflow-hidden">
            <p className="text-xs text-[var(--color-brand-muted)] mb-2 z-10 relative">Preview:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={newImageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map(item => (
          <div key={item.id} className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => handleRemoveImage(item.id)}
                className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {gallery.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--color-brand-muted)] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-8 h-8 opacity-50" />
            <p>No images in gallery. Add some to make the landing page beautiful!</p>
          </div>
        )}
      </div>
    </div>
  );
}
