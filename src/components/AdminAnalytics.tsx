import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  Clock,
  Users,
  CheckCircle2,
  Filter,
  UserPlus,
  ArrowUpRight,
  MoreVertical,
  ChevronDown,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsData, Complaint, User } from '../types';

interface AdminAnalyticsProps {
  complaints: Complaint[];
  onSelectComplaint: (id: string) => void;
  onRefreshData?: () => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  complaints,
  onSelectComplaint,
  onRefreshData,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedRange, setSelectedRange] = useState<'30d' | 'quarter' | 'ytd'>('30d');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign agent modal state
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).catch(console.error);
    api.getUsers().then((res) => {
      setAgents(res.users.filter((u) => u.role === 'agent' || u.role === 'admin'));
    }).catch(console.error);
  }, []);

  const handleAssignAgent = async () => {
    if (!assigningTicketId || !selectedAgentId) return;
    try {
      await api.assignAgent(assigningTicketId, selectedAgentId);
      setAssigningTicketId(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to assign agent', err);
    }
  };

  const filteredQueue = complaints.filter((c) => {
    const matchesDept = deptFilter === 'all' || c.department.toLowerCase() === deptFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#00288e] border border-blue-200">
            In Progress
          </span>
        );
      case 'new':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
            Pending
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
            Resolved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30]">Admin Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            System-wide resolution metrics, compliance SLA tracking, and queue distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting encrypted compliance audit report (PDF / CSV)...')}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            Export Compliance Audit
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 15 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Active */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Active
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-[#00288e]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">
              {analytics?.metrics.totalActive || 1248}
            </span>
            <span className="text-xs font-semibold text-emerald-600">+4.2%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Currently active enterprise tickets</p>
        </div>

        {/* Avg Resolution */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg Resolution
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">
              {analytics?.metrics.avgResolutionDays || 3.2} Days
            </span>
            <span className="text-xs font-semibold text-emerald-600">-18% vs target</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Exceeding 5-day corporate SLA</p>
        </div>

        {/* Critical Issues */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Critical Issues
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">
              {analytics?.metrics.criticalIssues || 14}
            </span>
            <span className="text-xs font-semibold text-amber-600">Under investigation</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Safety & high priority cases</p>
        </div>

        {/* Agent Load */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Agent Load
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30]">
              {analytics?.metrics.agentLoadPercent || 84}%
            </span>
            <span className="text-xs font-semibold text-slate-500">capacity</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Healthy workload distribution</p>
        </div>
      </div>

      {/* Analytics Charts Row: Resolution Trends + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Resolution Trends Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Resolution Trends</h3>
              <p className="text-xs text-slate-400">Weekly ticket volume by status</p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-medium border border-slate-200">
              <button
                onClick={() => setSelectedRange('30d')}
                className={`rounded-lg px-2.5 py-1 ${
                  selectedRange === '30d' ? 'bg-white font-bold text-[#00288e] shadow-2xs' : 'text-slate-600'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setSelectedRange('quarter')}
                className={`rounded-lg px-2.5 py-1 ${
                  selectedRange === 'quarter' ? 'bg-white font-bold text-[#00288e] shadow-2xs' : 'text-slate-600'
                }`}
              >
                This Quarter
              </button>
              <button
                onClick={() => setSelectedRange('ytd')}
                className={`rounded-lg px-2.5 py-1 ${
                  selectedRange === 'ytd' ? 'bg-white font-bold text-[#00288e] shadow-2xs' : 'text-slate-600'
                }`}
              >
                Year to Date
              </button>
            </div>
          </div>

          {/* Clean Interactive SVG Chart */}
          <div className="h-60 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#e2e8f0" />

              {/* Area & Line for Resolved (Emerald) */}
              <path
                d="M 20 120 Q 120 70, 220 85 T 420 40 T 490 35 L 490 140 L 20 140 Z"
                fill="rgba(16, 185, 129, 0.1)"
              />
              <path
                d="M 20 120 Q 120 70, 220 85 T 420 40 T 490 35"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Area & Line for Open (Blue) */}
              <path
                d="M 20 80 Q 120 45, 220 60 T 420 50 T 490 65 L 490 140 L 20 140 Z"
                fill="rgba(0, 40, 142, 0.08)"
              />
              <path
                d="M 20 80 Q 120 45, 220 60 T 420 50 T 490 65"
                fill="none"
                stroke="#00288e"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="20" cy="80" r="4" fill="#00288e" />
              <circle cx="220" cy="60" r="4" fill="#00288e" />
              <circle cx="420" cy="50" r="4" fill="#00288e" />
              <circle cx="490" cy="65" r="4" fill="#00288e" />

              <circle cx="20" cy="120" r="4" fill="#10b981" />
              <circle cx="220" cy="85" r="4" fill="#10b981" />
              <circle cx="420" cy="40" r="4" fill="#10b981" />
              <circle cx="490" cy="35" r="4" fill="#10b981" />
            </svg>

            {/* Legend & X-Axis labels */}
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-2">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#00288e]" />
                <span className="text-slate-600">Open Complaints</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Resolved Complaints</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status Distribution Donut Chart */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Status Distribution
            </h3>

            {/* Circular Donut Diagram */}
            <div className="flex justify-center items-center py-6">
              <div className="relative flex items-center justify-center">
                <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Open: 45% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#00288e"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="138" // 45%
                    strokeLinecap="round"
                  />
                  {/* Pending: 30% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="175" // 30%
                    transform="rotate(162 50 50)"
                    strokeLinecap="round"
                  />
                  {/* Resolved: 25% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="188" // 25%
                    transform="rotate(270 50 50)"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-[#0b1c30]">1,248</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Total
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00288e]" />
                <span className="text-slate-600">Open Tickets</span>
              </div>
              <span className="font-bold text-slate-800">45% (561)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">Pending Review</span>
              </div>
              <span className="font-bold text-slate-800">30% (374)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Resolved / Closed</span>
              </div>
              <span className="font-bold text-slate-800">25% (313)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Complaints Queue Table matching Screenshot 15 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 p-5">
          <div>
            <h2 className="text-lg font-bold text-[#0b1c30]">Active Complaints Queue</h2>
            <p className="text-xs text-slate-500">
              Real-time oversight across departments and active specialist loads
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue..."
                className="rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-[#00288e] focus:outline-hidden"
            >
              <option value="all">All Departments</option>
              <option value="Facilities">Facilities</option>
              <option value="Logistics & Storage">Logistics & Storage</option>
              <option value="IT Support">IT Support</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Security">Security</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-[#00288e] focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 w-10">
                  <input type="checkbox" className="rounded-sm border-slate-300 text-[#00288e]" />
                </th>
                <th className="px-5 py-3.5">ID / Title</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned Agent</th>
                <th className="px-5 py-3.5">Updated</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectComplaint(item.id)}
                  >
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded-sm border-slate-300 text-[#00288e]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-[#00288e]">#{item.id}</div>
                      <div className="font-semibold text-slate-900 text-xs mt-0.5 group-hover:text-[#00288e]">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.department}</td>
                    <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {item.assignedAgent ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={item.assignedAgent.avatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="font-medium text-slate-800 text-xs">
                            {item.assignedAgent.name}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAssigningTicketId(item.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-blue-400 hover:text-[#00288e]"
                        >
                          <UserPlus className="h-3 w-3" />
                          <span>Assign</span>
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {new Date(item.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item.id);
                        }}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3.5 text-xs text-slate-500">
          <span>
            Showing 1 to {filteredQueue.length} of {complaints.length} results
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

      {/* Assign Agent Dialog */}
      {assigningTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Assign Agent to #{assigningTicketId}
            </h3>
            <p className="text-xs text-slate-500">
              Select an on-duty specialist or compliance officer for this complaint.
            </p>

            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-[#00288e] focus:outline-hidden"
            >
              <option value="">-- Choose Agent --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.title || agent.role} - {agent.department})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningTicketId(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedAgentId}
                onClick={handleAssignAgent}
                className="rounded-xl bg-[#00288e] px-4 py-2 text-xs font-bold text-white hover:bg-[#00288e]/90 disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
