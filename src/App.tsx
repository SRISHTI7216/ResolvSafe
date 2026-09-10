import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { UserDashboard } from './components/UserDashboard';
import { AgentDashboard } from './components/AgentDashboard';
import { NewComplaintForm } from './components/NewComplaintForm';
import { ComplaintDetailsView } from './components/ComplaintDetailsView';
import { FeedbackModal } from './components/FeedbackModal';
import { AdminAnalytics } from './components/AdminAnalytics';
import { EmergencyEscalationModal } from './components/EmergencyEscalationModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CommandPalette } from './components/CommandPalette';
import { api } from './services/api';
import { Complaint, NotificationItem, ComplaintStatus, User } from './types';

function MainApp() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Navigation views: 'landing' | 'login' | 'register' | 'user_dashboard' | 'agent_dashboard' | 'analytics' | 'new_complaint' | 'complaint_details'
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('CMP-2024-0891');

  // Modals & Drawers
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [feedbackComplaintId, setFeedbackComplaintId] = useState<string | null>(null);

  // Core Data state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial complaints & notifications
  const fetchData = async () => {
    try {
      const [compRes, notifRes] = await Promise.all([
        api.getComplaints().catch(() => ({ complaints: [] })),
        api.getNotifications().catch(() => ({ notifications: [] })),
      ]);
      setComplaints(compRes.complaints || []);
      setNotifications(notifRes.notifications || []);
    } catch (err) {
      console.error('Failed to load complaints or notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Synchronize initial view based on role upon authentication if on auth views
  useEffect(() => {
    if (isAuthenticated && (currentView === 'login' || currentView === 'register')) {
      if (user?.role === 'agent') {
        setCurrentView('agent_dashboard');
      } else if (user?.role === 'admin') {
        setCurrentView('analytics');
      } else {
        setCurrentView('user_dashboard');
      }
    }
  }, [isAuthenticated, user?.role, currentView]);

  const handleSelectComplaint = (id: string) => {
    setSelectedComplaintId(id);
    setCurrentView('complaint_details');
  };

  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus) => {
    try {
      await api.updateComplaintStatus(id, newStatus);
      await fetchData();
      if (newStatus === 'resolved') {
        setFeedbackComplaintId(id);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNavigate = (view: string) => {
    if (view === 'emergency') {
      setIsEmergencyOpen(true);
      return;
    }
    if (view === 'auth' || view === 'login' || view === 'signin' || view === 'sign-in') {
      setCurrentView('login');
    } else if (view === 'signup' || view === 'sign-up' || view === 'register') {
      setCurrentView('register');
    } else if (
      view === 'user-dashboard' ||
      view === 'user_dashboard' ||
      view === 'my-complaints' ||
      view === 'dashboard'
    ) {
      if (!isAuthenticated) {
        setCurrentView('login');
      } else if (user?.role === 'agent') {
        setCurrentView('agent_dashboard');
      } else if (user?.role === 'admin') {
        setCurrentView('analytics');
      } else {
        setCurrentView('user_dashboard');
      }
    } else if (view === 'agent-dashboard' || view === 'agent_dashboard') {
      if (!isAuthenticated) {
        setCurrentView('login');
      } else if (user?.role === 'user') {
        setCurrentView('user_dashboard');
      } else {
        setCurrentView('agent_dashboard');
      }
    } else if (view === 'admin-analytics' || view === 'analytics') {
      if (!isAuthenticated) {
        setCurrentView('login');
      } else if (user?.role !== 'admin') {
        setCurrentView(user?.role === 'agent' ? 'agent_dashboard' : 'user_dashboard');
      } else {
        setCurrentView('analytics');
      }
    } else if (view === 'new-complaint' || view === 'new_complaint') {
      if (!isAuthenticated) {
        setCurrentView('login');
      } else if (user?.role === 'agent') {
        setCurrentView('agent_dashboard');
      } else {
        setCurrentView('new_complaint');
      }
    } else if (view === 'chat') {
      if (!isAuthenticated) {
        setCurrentView('login');
      } else if (complaints.length > 0) {
        handleSelectComplaint(complaints[0].id);
      } else {
        setCurrentView(
          user?.role === 'agent' ? 'agent_dashboard' : user?.role === 'admin' ? 'analytics' : 'user_dashboard'
        );
      }
    } else if (view === 'feedback') {
      if (!isAuthenticated) {
        setCurrentView('login');
      } else if (user?.role === 'admin') {
        setCurrentView('analytics');
      } else if (complaints.length > 0) {
        setFeedbackComplaintId(complaints[0].id);
      } else {
        setCurrentView('user_dashboard');
      }
    } else {
      setCurrentView(view);
    }
  };

  const handleAuthSuccess = (authedUser?: User) => {
    fetchData();
    const effectiveRole = authedUser?.role || user?.role;
    if (effectiveRole === 'agent') {
      setCurrentView('agent_dashboard');
    } else if (effectiveRole === 'admin') {
      setCurrentView('analytics');
    } else {
      setCurrentView('user_dashboard');
    }
  };

  // Render content based on authentication & current view
  const renderContent = () => {
    // 1. Unauthenticated views
    if (!isAuthenticated) {
      if (currentView === 'login') {
        return (
          <AuthScreen
            initialMode="login"
            onSuccess={handleAuthSuccess}
            onBackToLanding={() => setCurrentView('landing')}
          />
        );
      }

      if (currentView === 'register') {
        return (
          <AuthScreen
            initialMode="register"
            onSuccess={handleAuthSuccess}
            onBackToLanding={() => setCurrentView('landing')}
          />
        );
      }

      // Default for guests: Landing Page
      return (
        <LandingPage
          onRegisterComplaint={() => setCurrentView('login')}
          onTrackStatus={() => setCurrentView('login')}
          onOpenAuth={() => setCurrentView('login')}
          onSignUp={() => setCurrentView('register')}
          onSignIn={() => setCurrentView('login')}
        />
      );
    }

    // 2. Authenticated views
    if (currentView === 'landing') {
      return (
        <LandingPage
          onRegisterComplaint={() => setCurrentView('new_complaint')}
          onTrackStatus={() => setCurrentView('user_dashboard')}
          onOpenAuth={() => setCurrentView('user_dashboard')}
          onSignUp={() => setCurrentView('user_dashboard')}
          onSignIn={() => setCurrentView('user_dashboard')}
        />
      );
    }

    if (currentView === 'login' || currentView === 'register') {
      // User is already logged in, show their dashboard
      if (user?.role === 'agent') {
        return (
          <AgentDashboard
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      }
      if (user?.role === 'admin') {
        return (
          <AdminAnalytics
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onRefreshData={fetchData}
          />
        );
      }
      return (
        <UserDashboard
          complaints={complaints}
          onSelectComplaint={handleSelectComplaint}
          onNewComplaint={() => setCurrentView('new_complaint')}
        />
      );
    }

    if (currentView === 'new_complaint') {
      if (user?.role === 'agent') {
        return (
          <AgentDashboard
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      }
      return (
        <NewComplaintForm
          onSuccess={(newId) => {
            fetchData();
            handleSelectComplaint(newId);
          }}
          onCancel={() => {
            setCurrentView(user?.role === 'admin' ? 'analytics' : 'user_dashboard');
          }}
        />
      );
    }

    if (currentView === 'complaint_details') {
      return (
        <ComplaintDetailsView
          complaintId={selectedComplaintId}
          onBack={() => {
            setCurrentView(
              user?.role === 'agent'
                ? 'agent_dashboard'
                : user?.role === 'admin'
                ? 'analytics'
                : 'user_dashboard'
            );
          }}
          onOpenFeedback={(id) => setFeedbackComplaintId(id)}
        />
      );
    }

    if (currentView === 'agent_dashboard') {
      if (user?.role === 'user') {
        return (
          <UserDashboard
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onNewComplaint={() => setCurrentView('new_complaint')}
          />
        );
      }
      return (
        <AgentDashboard
          complaints={complaints}
          onSelectComplaint={handleSelectComplaint}
          onUpdateStatus={handleUpdateStatus}
        />
      );
    }

    if (currentView === 'analytics') {
      if (user?.role !== 'admin') {
        return user?.role === 'agent' ? (
          <AgentDashboard
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <UserDashboard
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onNewComplaint={() => setCurrentView('new_complaint')}
          />
        );
      }
      return (
        <AdminAnalytics
          complaints={complaints}
          onSelectComplaint={handleSelectComplaint}
          onRefreshData={fetchData}
        />
      );
    }

    // Role-specific defaults
    if (user?.role === 'agent') {
      return (
        <AgentDashboard
          complaints={complaints}
          onSelectComplaint={handleSelectComplaint}
          onUpdateStatus={handleUpdateStatus}
        />
      );
    }

    if (user?.role === 'admin') {
      return (
        <AdminAnalytics
          complaints={complaints}
          onSelectComplaint={handleSelectComplaint}
          onRefreshData={fetchData}
        />
      );
    }

    // Default: User Dashboard
    return (
      <UserDashboard
        complaints={complaints}
        onSelectComplaint={handleSelectComplaint}
        onNewComplaint={() => setCurrentView('new_complaint')}
      />
    );
  };

  const isAuthPage = currentView === 'login' || currentView === 'register';
  const isLanding = currentView === 'landing';
  const showSidebar = isAuthenticated && !isAuthPage && !isLanding;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#00288e]/20 border-t-[#00288e] rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Connecting to ResolvSafe...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#00288e] selection:text-white">
      {/* Header bar */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main body area */}
      <div className="flex-1 flex">
        {/* Render Sidebar only when authenticated and inside dashboard views */}
        {showSidebar && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        <main className={`flex-1 ${showSidebar ? 'pb-16' : ''}`}>
          {renderContent()}
        </main>
      </div>

      {/* Modals and Drawers */}
      <EmergencyEscalationModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onEscalated={(id) => {
          fetchData();
          handleSelectComplaint(id);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectNotification={(complaintId) => {
          if (complaintId) {
            handleSelectComplaint(complaintId);
          }
        }}
      />

      <FeedbackModal
        isOpen={!!feedbackComplaintId}
        complaintId={feedbackComplaintId || ''}
        onClose={() => setFeedbackComplaintId(null)}
        onSubmitted={fetchData}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        complaints={complaints}
        onSelectComplaint={handleSelectComplaint}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
