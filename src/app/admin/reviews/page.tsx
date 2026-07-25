'use client';

import React from 'react';
import { Trash2, Eye, EyeOff, Star } from 'lucide-react';
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

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-white">Reviews Management</h1>
        <p className="text-[var(--color-brand-muted)] mt-2">Moderate customer reviews shown on the landing page.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-sm text-[var(--color-brand-muted)]">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Rating</th>
              <th className="p-4 font-medium">Review</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {reviews.map((review) => (
              <tr key={review.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!review.isVisible ? 'opacity-50' : ''}`}>
                <td className="p-4 font-medium text-white">{review.author}</td>
                <td className="p-4">
                  <div className="flex text-yellow-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </td>
                <td className="p-4 max-w-md truncate text-gray-300">{review.comment}</td>
                <td className="p-4 text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title={review.isVisible ? "Hide Review" : "Show Review"}
                  >
                    {review.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleRemoveReview(review.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--color-brand-muted)]">
                  No reviews available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
