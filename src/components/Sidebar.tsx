import React from 'react';
import {
  AlertTriangle,
  LogOut,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenEmergency: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenEmergency,
}) => {
  const { user, logout } = useAuth();

  const role = user?.role || 'user';

  const userNavItems = [
    {
      id: 'user-dashboard',
      label: 'My Dashboard',
      icon: 'dashboard',
    },
    {
      id: 'my-complaints',
      label: 'My Complaints',
      icon: 'description',
    },
    {
      id: 'new-complaint',
      label: 'File Complaint',
      icon: 'edit_square',
    },
    {
      id: 'chat',
      label: 'Live Chat',
      icon: 'chat',
      badge: 'Live',
    },
    {
      id: 'landing',
      label: 'Public Portal',
      icon: 'public',
    },
  ];

  const agentNavItems = [
    {
      id: 'agent-dashboard',
      label: 'Assigned Queue',
      icon: 'view_kanban',
      badge: 'Active',
    },
    {
      id: 'chat',
      label: 'Live Chat',
      icon: 'chat',
      badge: 'Live',
    },
    {
      id: 'landing',
      label: 'Public Portal',
      icon: 'public',
    },
  ];

  const adminNavItems = [
    {
      id: 'admin-analytics',
      label: 'Executive Analytics',
      icon: 'monitoring',
      badge: 'HQ',
    },
    {
      id: 'agent-dashboard',
      label: 'All Complaints',
      icon: 'view_kanban',
    },
    {
      id: 'feedback',
      label: 'User Feedback',
      icon: 'rate_review',
    },
    {
      id: 'landing',
      label: 'Public Portal',
      icon: 'public',
    },
  ];

  const navItems =
    role === 'admin' ? adminNavItems : role === 'agent' ? agentNavItems : userNavItems;

  return (
    <aside className="w-64 shrink-0 border-r border-[#e2e8f0] bg-white flex flex-col justify-between hidden md:flex h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-6">
        {/* Navigation Group */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive =
              currentView === item.id ||
              (item.id === 'my-complaints' && currentView === 'complaint-detail');

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00288e] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-[#00288e]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Emergency Escalation Button (prominently featured in all sidebars) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenEmergency}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white px-4 py-3 text-sm font-bold shadow-sm transition-all hover:shadow-md"
          >
            <AlertTriangle className="h-4 w-4 text-white animate-bounce" />
            <span>Emergency Escalation</span>
          </button>
          <p className="mt-1.5 text-center text-[11px] text-slate-400">
            Immediate dispatch for critical safety issues
          </p>
        </div>
      </div>

      {/* Footer / Account section */}
      <div className="p-4 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1 hover:text-slate-800 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Support</span>
          </button>
          <button
            onClick={() => onNavigate('admin-analytics')}
            className="flex items-center gap-1 hover:text-slate-800 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {user && (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={
                  user.avatar ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuATSxsxQQJQVOe4fe3qu82ylWcQEx1a7vBP0jy5kMNbvTeVf6SN8oGC31n5LBEvdhihadmUPRRM1QPwqOKrAR70gvsMYsVUnYnICSFpvIxjfMHALz39TEXqkCF5YUwXkZyMKrXKOc_kqra5JK1qDHcvVAdap5jtjUEMBHDVfV1wK8A3B4NkpoPUEP6L34MOOA-2-V2ZXK1AhX_w-T6MhBPnYj6OB3iVXqzacDpjZFZU4q1KL7N2YAIr'
                }
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-300"
              />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 truncate">{user.name}</div>
                <div className="text-[11px] text-slate-400 truncate capitalize">{user.role}</div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate('auth');
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
