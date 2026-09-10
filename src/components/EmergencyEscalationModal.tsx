import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, PhoneCall, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface EmergencyEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEscalated?: (complaintId: string) => void;
  currentComplaintId?: string;
}

export const EmergencyEscalationModal: React.FC<EmergencyEscalationModalProps> = ({
  isOpen,
  onClose,
  onEscalated,
  currentComplaintId,
}) => {
  const [reason, setReason] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.triggerEmergencyEscalation({
        complaintId: currentComplaintId,
        reason: reason.trim(),
        contactNumber: contactNumber.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onEscalated) onEscalated(res.complaint.id);
      }, 2000);
    } catch (err) {
      console.error('Failed to escalate', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-red-500 bg-white p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">🚨 Critical Escalation Dispatched</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Executive safety and compliance liaisons have been alerted immediately via priority paging.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-red-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-950">Emergency Safety Escalation</h2>
                <p className="text-xs text-red-700">Immediate response protocol for acute hazards</p>
              </div>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-800 leading-relaxed border border-red-200">
              <strong>Notice:</strong> Use this channel exclusively for active electrical or structural hazards,
              threats to personal physical safety, severe harassment, or critical compliance violations.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Urgent Situation Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the immediate danger, exact physical location (building, floor, room), and whether any injuries occurred..."
                  className="w-full rounded-xl border border-red-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-hidden focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Immediate Contact Phone / Radio Channel
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g., +1 (555) 911-0012 or Ch. 4 Operations"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>{submitting ? 'Dispatching Alert...' : 'Dispatch Emergency Team'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
