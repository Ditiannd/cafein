'use client';

import React from 'react';
import { Trash2, Eye, EyeOff, Star, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApiQuery } from '@/lib/hooks';
import { api } from '@/lib/api';

export default function ReviewsManagementPage() {
  const { data: reviews = [], refetch } = useApiQuery('admin-reviews', () => api.reviews.listAll());

  const handleToggleVisibility = async (id: number, current: boolean) => {
    try {
      await api.reviews.toggleVisibility(id, !current);
      refetch();
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const handleRemoveReview = async (id: number) => {
    try {
      await api.reviews.delete(id);
      refetch();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const visibleCount = reviews.filter(r => r.isVisible).length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans select-none text-zinc-100">
      <div className="flex justify-between items-end mb-8 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Patron Testimonial Moderation</h1>
            <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">Feedback Vault</span>
          </div>
          <p className="text-zinc-400 text-xs font-mono mt-1">Audit, curate, and moderate customer satisfaction testimonials broadcasted on the sanctuary home portal.</p>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 font-mono text-xs">
        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Sanctuary Rating Index</span>
            <span className="text-2xl font-extrabold text-white font-sans">{avgRating} / 5.0 Stars</span>
          </div>
        </div>

        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Public Broadcast Feed</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-sans">{visibleCount} Active Testimonials</span>
          </div>
        </div>

        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Total Submitted Logs</span>
            <span className="text-2xl font-extrabold text-sky-400 font-sans">{reviews.length} Entries</span>
          </div>
        </div>
      </div>

      <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-bold bg-zinc-950/80 tracking-wider">
              <th className="p-5">Patron Author</th>
              <th className="p-5">Calibrated Rating</th>
              <th className="p-5">Testimonial Narrative</th>
              <th className="p-5">Timestamp</th>
              <th className="p-5">Broadcast Status</th>
              <th className="p-5 text-right">Moderation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans text-sm">
            {reviews.map((review) => (
              <tr key={review.id} className={`hover:bg-zinc-900/90 transition-all group ${!review.isVisible ? 'opacity-40 bg-zinc-950/40' : ''}`}>
                <td className="p-5 font-heading font-extrabold text-white group-hover:text-amber-300 transition-colors">{review.author}</td>
                <td className="p-5 font-mono">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </td>
                <td className="p-5 max-w-md text-zinc-300 font-normal italic">&ldquo;{review.comment}&rdquo;</td>
                <td className="p-5 text-zinc-500 font-mono text-xs">{new Date(review.createdAt).toLocaleDateString()}</td>
                <td className="p-5 font-mono text-xs">
                  {review.isVisible ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-[10px]">
                      ● LIVE BROADCAST
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold uppercase text-[10px]">
                      ○ HIDDEN / MUTED
                    </span>
                  )}
                </td>
                <td className="p-5 text-right font-mono">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                      className={`p-2 rounded-xl transition-all font-bold ${
                        review.isVisible 
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-zinc-950'
                      }`}
                      title={review.isVisible ? "Mute from Landing Page" : "Restore to Landing Page"}
                    >
                      {review.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleRemoveReview(review.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/50 rounded-xl text-rose-400 transition-all"
                      title="Permanently Expunge Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="p-20 text-center text-zinc-600 font-mono">
                  <MessageSquare className="w-10 h-10 mx-auto text-zinc-700 mb-2 stroke-[1.5]" />
                  <span>No patron testimonials logged in vault.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
