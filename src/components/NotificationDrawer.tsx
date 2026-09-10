import React from 'react';
import {
  Bell,
  X,
  CheckCheck,
  UserCheck,
  RefreshCw,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (complaintId?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'agent_assigned':
        return <UserCheck className="h-4 w-4 text-[#00288e]" />;
      case 'status_updated':
        return <RefreshCw className="h-4 w-4 text-emerald-600" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#00288e]" />
            <h2 className="font-bold text-sm text-[#0b1c30]">Notifications</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-[#00288e]">
              {notifications.filter((n) => !n.read).length} new
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#00288e]"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 text-xs">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No notifications at this time.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onSelectNotification(notif.complaintId);
                  onClose();
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 ${
                  !notif.read ? 'bg-blue-50/40 font-medium' : ''
                }`}
              >
                <div className="mt-0.5 rounded-xl bg-slate-100 p-2 shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 truncate">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-600 leading-relaxed">{notif.description}</p>
                  {notif.complaintId && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-[#00288e]">
                      <span>View ticket #{notif.complaintId}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-[#00288e] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 text-center text-xs text-slate-400">
          ResolvSafe Real-time Triage Push Engine
        </div>
      </div>
    </div>
  );
};
