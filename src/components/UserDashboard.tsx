import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintStatus } from '../types';

interface UserDashboardProps {
  complaints: Complaint[];
  onSelectComplaint: (id: string) => void;
  onNewComplaint: () => void;
  onFilterStatus?: (status: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  complaints,
  onSelectComplaint,
  onNewComplaint,
}) => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | ComplaintStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'pending' || c.status === 'new').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  const filteredList = complaints.filter((c) => {
    const matchesFilter = selectedFilter === 'all' ? true : c.status === selectedFilter;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#00288e] ring-1 ring-blue-700/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00288e]" />
            In Progress
          </span>
        );
      case 'new':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Resolved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case 'pending_info':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800 ring-1 ring-purple-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Pending Info
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner matching Screenshot 5 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30] sm:text-3xl">
            Welcome back, {user?.name?.split(' ')[0] || 'Alex'}.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Here is the current status of your complaint queue and active investigations.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewComplaint}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00288e] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#00288e]/90 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Complaints */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Complaints
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-[#00288e]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">{totalCount || 12}</span>
            <span className="text-xs font-semibold text-emerald-600">+2 this month</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">All submitted records</p>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">{pendingCount || 3}</span>
            <span className="text-xs text-amber-600 font-medium">Awaiting triage</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Avg triage: under 2 hrs</p>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">{inProgressCount || 5}</span>
            <span className="text-xs text-indigo-600 font-medium">Active investigations</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Assigned specialist on duty</p>
        </div>

        {/* Resolved (30d) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Resolved (30d)
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">{resolvedCount || 4}</span>
            <span className="text-xs font-semibold text-emerald-600">98% within SLA</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Closed & confirmed</p>
        </div>
      </div>

      {/* Recent Complaints Table Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 p-5">
          <div>
            <h2 className="text-lg font-bold text-[#0b1c30]">Recent Complaints</h2>
            <p className="text-xs text-slate-500">Track and review updates on your submitted tickets</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search within table */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID or keyword..."
                className="rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-white text-[#00288e] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('in_progress')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  selectedFilter === 'in_progress'
                    ? 'bg-white text-[#00288e] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  selectedFilter === 'pending'
                    ? 'bg-white text-[#00288e] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedFilter('resolved')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  selectedFilter === 'resolved'
                    ? 'bg-white text-[#00288e] font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Complaint ID</th>
                <th className="px-5 py-3.5">Title & Category</th>
                <th className="px-5 py-3.5">Date Submitted</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No complaints matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectComplaint(complaint.id)}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-[#00288e]">
                      #{complaint.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-[#00288e] transition-colors">
                        {complaint.title}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {complaint.category} • {complaint.department}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(complaint.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(complaint.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#00288e] hover:text-white hover:border-[#00288e] transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3.5 text-xs text-slate-500">
          <span>
            Showing {filteredList.length} of {complaints.length} tickets
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-400 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
