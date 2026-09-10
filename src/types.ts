export type UserRole = 'user' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  title?: string;
  avatar?: string;
  createdAt?: string;
}

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintStatus =
  | 'new'
  | 'pending'
  | 'in_progress'
  | 'pending_info'
  | 'resolved'
  | 'rejected';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: {
    name: string;
    role: string;
    avatar?: string;
  };
  type?: 'status' | 'assigned' | 'created' | 'escalated' | 'note';
}

export interface AssignedAgent {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  avgResponseTime: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  substatusNote?: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    isAnonymous?: boolean;
  };
  assignedAgent: AssignedAgent | null;
  attachments: Attachment[];
  timeline: TimelineEvent[];
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  complaintId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'agent' | 'admin' | 'system';
  senderAvatar?: string;
  message: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'agent_assigned' | 'status_updated' | 'complaint_received' | 'emergency';
  read: boolean;
  timestamp: string;
  complaintId?: string;
}

export interface AnalyticsData {
  metrics: {
    totalActive: number;
    avgResolutionDays: number;
    criticalIssues: number;
    agentLoadPercent: number;
    resolutionRatePercent: number;
    avgHandlingHours: number;
  };
  statusDistribution: {
    open: number;
    pending: number;
    resolved: number;
  };
  resolutionTrends: Array<{
    label: string;
    open: number;
    resolved: number;
    critical: number;
  }>;
  agentWorkload: Array<{
    name: string;
    activeTickets: number;
    capacity: string;
    department: string;
    resolutionRate: string;
  }>;
}
