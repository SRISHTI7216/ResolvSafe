import React, { useState, useEffect } from 'react';
import { Search, FileText, Plus, ShieldAlert, BarChart3, ArrowRight, X } from 'lucide-react';
import { Complaint } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: Complaint[];
  onSelectComplaint: (id: string) => void;
  onNavigate: (view: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  complaints,
  onSelectComplaint,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedComplaints = complaints.filter(
    (c) =>
      c.id.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden space-y-2">
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets by ID, title, or action... (ESC to exit)"
            className="w-full p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-3 text-xs">
          <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-2 pb-1">
            Quick Actions
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('new_complaint');
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
            >
              <Plus className="h-4 w-4 text-[#00288e]" />
              <span>Submit a New Complaint</span>
            </button>
            <button
              onClick={() => {
                onNavigate('emergency');
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-red-700 hover:bg-red-50 font-medium"
            >
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>Trigger Emergency Safety Escalation</span>
            </button>
            <button
              onClick={() => {
                onNavigate('analytics');
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
            >
              <BarChart3 className="h-4 w-4 text-[#00288e]" />
              <span>View Admin Resolution Analytics</span>
            </button>
          </div>
        </div>

        {/* Search results */}
        {matchedComplaints.length > 0 && (
          <div className="p-3 border-t border-slate-100 text-xs max-h-60 overflow-y-auto">
            <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-2 pb-1">
              Matching Complaints ({matchedComplaints.length})
            </div>
            <div className="space-y-1">
              {matchedComplaints.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectComplaint(c.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-slate-800 hover:bg-slate-100 group text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-[#00288e] shrink-0" />
                    <span className="font-mono font-bold text-[#00288e]">#{c.id}</span>
                    <span className="truncate font-medium">{c.title}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-slate-700">
                    {c.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
