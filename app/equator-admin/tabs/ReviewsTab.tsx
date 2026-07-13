import { Star, MessageSquare } from 'lucide-react';
import type { Review, NewReviewForm, EnrichedBooking } from '../types';

interface Props {
  darkMode: boolean;
  reviews: Review[];
  bookings: EnrichedBooking[];
  newReview: NewReviewForm;
  setNewReview: (fn: (prev: NewReviewForm) => NewReviewForm) => void;
  savingReview: boolean;
  reviewError: string;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePublish: (id: string, current: boolean) => void;
}

export function ReviewsTab({
  darkMode, reviews, bookings, newReview, setNewReview,
  savingReview, reviewError, onSubmit, onTogglePublish,
}: Props) {
  return (
    <div className="max-w-3xl">
      {/* Add Review */}
      <div className={`rounded-xl border p-5 mb-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Add Review</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Guest Name</label>
              <input type="text" required value={newReview.guestName}
                onChange={e => setNewReview(p => ({ ...p, guestName: e.target.value }))} placeholder="Guest name"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>
            <div>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email (optional)</label>
              <input type="email" value={newReview.guestEmail}
                onChange={e => setNewReview(p => ({ ...p, guestEmail: e.target.value }))} placeholder="guest@email.com"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Rating</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button" onClick={() => setNewReview(p => ({ ...p, rating: i }))} className="cursor-none">
                  <Star size={22} className={i <= newReview.rating ? 'text-amber-500 fill-amber-500' : darkMode ? 'text-slate-700' : 'text-slate-200'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Comment</label>
            <textarea value={newReview.comment}
              onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} rows={3} placeholder="Guest's review..."
              className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
          </div>
          {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
          <button type="submit" disabled={savingReview}
            className="py-2.5 px-5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-none disabled:opacity-50 flex items-center gap-2">
            {savingReview ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquare size={14} />} Add Review
          </button>
        </form>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{r.guest_name}</p>
                <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${r.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= r.rating ? 'text-amber-500 fill-amber-500' : darkMode ? 'text-slate-700' : 'text-slate-200'} />)}
              </div>
              {r.comment && <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{r.comment}</p>}
              <p className={`text-[10px] mt-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => onTogglePublish(r.id, r.is_published)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-none whitespace-nowrap ${r.is_published ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
              {r.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}