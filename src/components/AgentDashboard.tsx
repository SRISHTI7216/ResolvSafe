import React, { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  TrendingUp,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface AgentDashboardProps {
  complaints: Complaint[];
  onSelectComplaint: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, note?: string) => Promise<void>;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  complaints,
  onSelectComplaint,
  onUpdateStatus,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Group into Kanban columns matching Screenshot 7
  const newColumn = complaints.filter(
    (c) =>
      (c.status === 'new' || c.status === 'pending') &&
      (c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const inProgressColumn = complaints.filter(
    (c) =>
      c.status === 'in_progress' &&
      (c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingInfoColumn = complaints.filter(
    (c) =>
      (c.status === 'pending_info' || c.status === 'rejected') &&
      (c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleQuickStatusChange = async (id: string, nextStatus: ComplaintStatus) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return (
          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 border border-rose-200">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
            Low
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header matching Screenshot 7 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30]">Agent Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage and track your active complaint queue and dispute investigations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets (⌘K)..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Grid: Kanban Columns (left 8/12) + Agent Performance/Activity (right 4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kanban Board */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          {/* Column 1: New */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">New</h3>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {newColumn.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {newColumn.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No new tickets</div>
              ) : (
                newColumn.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectComplaint(item.id)}
                    className="group rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#00288e]">#{item.id}</span>
                      {renderPriorityBadge(item.priority)}
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 group-hover:text-[#00288e]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        2h ago
                      </span>

                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickStatusChange(item.id, 'in_progress');
                        }}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#00288e] hover:bg-[#00288e] hover:text-white transition-colors"
                      >
                        Start Investigation
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  In Progress
                </h3>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {inProgressColumn.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {inProgressColumn.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No active investigations
                </div>
              ) : (
                inProgressColumn.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectComplaint(item.id)}
                    className="group rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#00288e]">#{item.id}</span>
                      {renderPriorityBadge(item.priority)}
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 group-hover:text-[#00288e]">
                        {item.title}
                      </h4>
                      {item.substatusNote && (
                        <div className="mt-1.5 inline-block rounded-sm bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                          {item.substatusNote}
                        </div>
                      )}
                    </div>

                    {item.attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded-md">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{item.attachments[0].name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        1d ago
                      </span>

                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickStatusChange(item.id, 'resolved');
                        }}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Pending Info */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pending Info
                </h3>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {pendingInfoColumn.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {pendingInfoColumn.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No tickets awaiting info
                </div>
              ) : (
                pendingInfoColumn.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectComplaint(item.id)}
                    className="group rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#00288e]">#{item.id}</span>
                      {renderPriorityBadge(item.priority)}
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 group-hover:text-[#00288e]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        3d ago
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item.id);
                        }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        Follow Up
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Performance & Recent Activity Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Your Performance Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Your Performance</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                This Week
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>Resolution Rate</span>
                  <span className="font-bold text-emerald-600">92%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '92%' }} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>Target: 85%</span>
                  <span>+7% above goal</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <div className="text-[11px] text-slate-500">Avg. Handling Time</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">1.4 hrs</span>
                  <span className="text-xs font-semibold text-emerald-600">12% faster</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Calculated across 28 closed inquiries this period
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <button
                onClick={() => alert('Viewing complete audit logs')}
                className="text-xs font-medium text-[#00288e] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Closed ticket #RS-4910</div>
                  <div className="text-[11px] text-slate-500">
                    Catering vendor contract amended.
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">25m ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-blue-100 p-1 text-[#00288e]">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Added note to #RS-4890</div>
                  <div className="text-[11px] text-slate-500">ID scan approved by SecOps.</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">1h ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-amber-100 p-1 text-amber-700">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Assigned #CMP-2024-0891</div>
                  <div className="text-[11px] text-slate-500">
                    Dispatched maintenance to Warehouse B.
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">3h ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
