import React, { useState } from 'react';
import { Star, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';

interface FeedbackModalProps {
  complaintId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  complaintId,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitFeedback(complaintId, rating, comment);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSubmitted) onSubmitted();
      }, 1500);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Thank you for your feedback!</h3>
            <p className="text-xs text-slate-500">
              Your response helps us maintain rigorous resolution standards across our departments.
            </p>
          </div>
        ) : (
          <>
            {/* Header with checkmark icon matching Screenshot 13 */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">Complaint Resolved</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We've closed ticket <span className="font-mono font-bold text-[#00288e]">#{complaintId}</span>.
                How was your resolution experience?
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-hidden"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-300'
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Comments
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What went well, or what could we improve?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Action buttons matching Screenshot 13 */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-[#00288e] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#00288e]/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
