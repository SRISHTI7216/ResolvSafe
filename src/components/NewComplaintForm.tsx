import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Shield,
  Paperclip,
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintPriority, Attachment } from '../types';

interface NewComplaintFormProps {
  onSuccess: (complaintId: string) => void;
  onCancel: () => void;
}

export const NewComplaintForm: React.FC<NewComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Service Quality');
  const [department, setDepartment] = useState('Facilities');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: 'att-default-1',
      name: 'incident_overview_photo.png',
      size: '1.4 MB',
      type: 'image/png',
    },
  ]);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setTimeout(() => {
      const newItems: Attachment[] = Array.from(files).map((f: File, idx: number) => ({
        id: `att-up-${Date.now()}-${idx}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.type || 'application/octet-stream',
      }));
      setAttachments((prev) => [...prev, ...newItems]);
      setUploading(false);
    }, 400);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!title.trim()) {
        setError('Please enter a descriptive complaint title.');
        return;
      }
      if (!description.trim() || description.trim().length < 15) {
        setError('Please provide a detailed description (at least 15 characters).');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createComplaint({
        title,
        category,
        department,
        description,
        priority,
        attachments,
        isAnonymous,
      });
      onSuccess(res.complaint.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30]">Submit New Complaint</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Log an incident or dispute. All submissions follow encrypted compliance protocols.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>

      {/* Stepper Header (matching Screenshot 9) */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 1
                ? 'bg-[#00288e] text-white ring-4 ring-blue-100'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Step 1: Details</div>
            <div className="text-[11px] text-slate-400">Context & category</div>
          </div>
        </div>

        <div className="hidden sm:block h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 2
                ? 'bg-[#00288e] text-white ring-4 ring-blue-100'
                : currentStep > 2
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : '2'}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Step 2: Attachments</div>
            <div className="text-[11px] text-slate-400">Evidence & files</div>
          </div>
        </div>

        <div className="hidden sm:block h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 3
                ? 'bg-[#00288e] text-white ring-4 ring-blue-100'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            3
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Step 3: Review</div>
            <div className="text-[11px] text-slate-400">Confirmation</div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Details */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Complaint Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaking water pipe creating slip hazard in Warehouse B"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
              >
                <option value="Logistics & Storage">Logistics & Storage</option>
                <option value="Billing & Finance">Billing & Finance</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Service Quality">Service Quality</option>
                <option value="HR & Employee Relations">HR & Employee Relations</option>
                <option value="Policy Violation">Policy Violation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Related Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
              >
                <option value="Logistics & Storage">Logistics & Storage</option>
                <option value="Facilities">Facilities Management</option>
                <option value="IT Support">Information Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
              </select>
            </div>
          </div>

          {/* Priority Level Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['low', 'medium', 'high', 'urgent'] as ComplaintPriority[]).map((level) => {
                const isSelected = priority === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={`rounded-xl p-3 text-left border transition-all ${
                      isSelected
                        ? level === 'urgent'
                          ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-300'
                          : level === 'high'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-300'
                          : 'border-[#00288e] bg-blue-50 text-[#00288e] ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase">{level}</span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-current" />}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 capitalize">
                      {level === 'urgent'
                        ? 'Immediate hazard'
                        : level === 'high'
                        ? '12h target response'
                        : level === 'medium'
                        ? '24h target response'
                        : 'Standard resolution'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              <span>Detailed Description</span>
              <span className="text-[11px] font-normal text-slate-400">
                {description.length} chars
              </span>
            </div>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, exact location, involved parties, date and time, and any prior reports made..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#00288e]" />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Whistleblower Anonymity Protection
                </div>
                <div className="text-[11px] text-slate-500">
                  Your identity will be masked as "Anonymous Employee" across all views.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00288e]"></div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#00288e]/90 active:scale-95 transition-all"
            >
              <span>Next: Attachments</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Attachments */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upload Evidence & Documentation</h3>
            <p className="text-xs text-slate-500">
              Attach photographs, emails, PDFs, or scanned records supporting your report.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="rounded-full bg-blue-100 p-3 text-[#00288e] mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Click to browse or drop files here
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Supports PNG, JPG, PDF, DOCX up to 25MB each
            </span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Files ({attachments.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Paperclip className="h-4 w-4 text-[#00288e] shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {att.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{att.size}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#00288e]/90"
            >
              <span>Next: Review & Confirm</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Review Complaint Summary</h3>
            <p className="text-xs text-slate-500">
              Confirm the incident details before submitting to the automated triage queue.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4 text-xs">
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Complaint Title:</span>
              <span className="font-bold text-slate-900 text-right">{title}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Category & Department:</span>
              <span className="font-semibold text-slate-800">
                {category} • {department}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Priority Level:</span>
              <span className="font-bold uppercase tracking-wider text-[#00288e]">
                {priority}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Reporter Status:</span>
              <span className="font-semibold text-slate-800">
                {isAnonymous ? 'Protected Anonymous Whistleblower' : 'Verified Corporate ID'}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Attached Documents:</span>
              <span className="font-semibold text-slate-800">{attachments.length} files</span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Description Narrative:</span>
              <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-8 py-3 text-xs font-bold text-white shadow-md hover:bg-[#00288e]/90 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting to Queue...</span>
              ) : (
                <>
                  <span>Confirm & Submit Complaint</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
