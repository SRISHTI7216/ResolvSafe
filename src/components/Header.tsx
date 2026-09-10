import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Bell,
  AlertTriangle,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
  onOpenEmergency: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenEmergency,
  onOpenNotifications,
  unreadNotificationsCount,
}) => {
  const { user, logout, switchRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string }> = {
    user: { title: 'Employee View', badge: 'bg-blue-100 text-blue-800' },
    agent: { title: 'Agent View', badge: 'bg-emerald-100 text-emerald-800' },
    admin: { title: 'Admin View', badge: 'bg-purple-100 text-purple-800' },
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-white px-4 md:px-6 shadow-xs">
      {/* Brand & Left Section */}
      <div className="flex items-center gap-3 md:gap-8">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden"
          title="Return to ResolvSafe Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00288e] text-white shadow-sm ring-2 ring-[#00288e]/20">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#00288e]">ResolvSafe</span>
            <span className="hidden text-[10px] uppercase font-semibold tracking-wider text-slate-400 sm:block">
              Enterprise Trust
            </span>
          </div>
        </button>

        {/* Navigation for Landing / Public */}
        {currentView === 'landing' && (
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <button
              onClick={() => onNavigate('landing')}
              className="text-[#00288e] font-semibold transition-colors hover:text-[#00288e]"
            >
              Overview
            </button>

            {user?.role === 'user' && (
              <>
                <button
                  onClick={() => onNavigate('user-dashboard')}
                  className="transition-colors hover:text-[#00288e]"
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => onNavigate('new-complaint')}
                  className="transition-colors hover:text-[#00288e]"
                >
                  File Complaint
                </button>
              </>
            )}

            {user?.role === 'agent' && (
              <button
                onClick={() => onNavigate('agent-dashboard')}
                className="transition-colors hover:text-[#00288e]"
              >
                Assigned Queue
              </button>
            )}

            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => onNavigate('admin-analytics')}
                  className="transition-colors hover:text-[#00288e]"
                >
                  Analytics
                </button>
                <button
                  onClick={() => onNavigate('agent-dashboard')}
                  className="transition-colors hover:text-[#00288e]"
                >
                  All Complaints
                </button>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Center Search Input / Trigger */}
      <div className="flex flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="group relative flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-left text-sm text-slate-500 transition-all hover:border-slate-300 hover:bg-white"
        >
          <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          <span className="flex-1 truncate">Search complaints, tickets, or policy...</span>
          <kbd className="hidden rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Emergency Escalation Button */}
        <button
          type="button"
          onClick={onOpenEmergency}
          className="relative inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 border border-red-200 shadow-2xs transition-colors hover:bg-red-100 active:scale-95"
          title="Rapid Emergency Escalation"
        >
          <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
          <span className="hidden sm:inline">Emergency Escalation</span>
        </button>

        {/* Multi-role Switcher Pill (for instant testing of all screens) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Switch Demo Role"
          >
            <span className="text-[11px] text-slate-400">Role:</span>
            <span
              className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                roleLabels[user?.role || 'user'].badge
              }`}
            >
              {user?.role || 'user'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2.5 py-2 text-xs font-semibold text-slate-400">
                Switch Interactive Role
              </div>
              <button
                type="button"
                onClick={() => {
                  switchRole('user');
                  setRoleMenuOpen(false);
                  onNavigate('user-dashboard');
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left ${
                  user?.role === 'user' ? 'bg-blue-50 text-[#00288e] font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-800">Employee / Complainant</div>
                  <div className="text-[11px] text-slate-500">Alex Rivera (Logistics)</div>
                </div>
                {user?.role === 'user' && <span className="h-1.5 w-1.5 rounded-full bg-[#00288e]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  switchRole('agent');
                  setRoleMenuOpen(false);
                  onNavigate('agent-dashboard');
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left ${
                  user?.role === 'agent' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-800">Assigned Agent</div>
                  <div className="text-[11px] text-slate-500">Marcus T. (Facilities Mgmt)</div>
                </div>
                {user?.role === 'agent' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  setRoleMenuOpen(false);
                  onNavigate('admin-analytics');
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left ${
                  user?.role === 'admin' ? 'bg-purple-50 text-purple-800 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-800">System Admin</div>
                  <div className="text-[11px] text-slate-500">Full Analytics & Oversight</div>
                </div>
                {user?.role === 'admin' && <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar / Dropdown */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-full p-1 ring-2 ring-slate-200 hover:ring-[#00288e]/40 transition-all focus:outline-hidden"
            >
              <img
                src={
                  user.avatar ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuATSxsxQQJQVOe4fe3qu82ylWcQEx1a7vBP0jy5kMNbvTeVf6SN8oGC31n5LBEvdhihadmUPRRM1QPwqOKrAR70gvsMYsVUnYnICSFpvIxjfMHALz39TEXqkCF5YUwXkZyMKrXKOc_kqra5JK1qDHcvVAdap5jtjUEMBHDVfV1wK8A3B4NkpoPUEP6L34MOOA-2-V2ZXK1AhX_w-T6MhBPnYj6OB3iVXqzacDpjZFZU4q1KL7N2YAIr'
                }
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <div className="font-semibold text-slate-800 text-sm">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1 inline-block rounded-sm bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[#00288e] capitalize">
                    {user.title || user.role} • {user.department || 'ResolvSafe'}
                  </div>
                </div>

                <div className="py-1">
                  {user?.role === 'user' && (
                    <>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('user-dashboard');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">dashboard</span>
                        My Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('new-complaint');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">add_circle</span>
                        File New Complaint
                      </button>
                    </>
                  )}

                  {user?.role === 'agent' && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('agent-dashboard');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">view_kanban</span>
                      Assigned Kanban Queue
                    </button>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('admin-analytics');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">monitoring</span>
                        Executive Analytics
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('agent-dashboard');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">view_kanban</span>
                        All Complaints Queue
                      </button>
                    </>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      onNavigate('login');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="rounded-lg bg-[#00288e] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#00288e]/90 transition-colors"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
