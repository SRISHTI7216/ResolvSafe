import {
  User,
  Complaint,
  ChatMessage,
  Feedback,
  NotificationItem,
  AnalyticsData,
  UserRole,
} from '../types';

const TOKEN_KEY = 'resolvsafe_auth_token';
const DEMO_USER_KEY = 'resolvsafe_demo_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const demoUser = localStorage.getItem(DEMO_USER_KEY);
  if (demoUser) {
    headers.set('x-demo-user-id', demoUser);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: UserRole
  ): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, role }),
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async switchDemoRole(role: UserRole): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    setStoredToken(data.token);
    localStorage.setItem(DEMO_USER_KEY, data.user.id);
    return data;
  },

  async getUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/auth/users');
  },

  // Complaints
  async getComplaints(params: Record<string, string> = {}): Promise<{ complaints: Complaint[] }> {
    const query = new URLSearchParams(params).toString();
    return request<{ complaints: Complaint[] }>(`/api/complaints${query ? `?${query}` : ''}`);
  },

  async getComplaint(id: string): Promise<{ complaint: Complaint }> {
    return request<{ complaint: Complaint }>(`/api/complaints/${id}`);
  },

  async createComplaint(payload: Partial<Complaint>): Promise<{ complaint: Complaint }> {
    return request<{ complaint: Complaint }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateComplaintStatus(
    id: string,
    status: string,
    note?: string
  ): Promise<{ complaint: Complaint }> {
    return request<{ complaint: Complaint }>(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  async assignAgent(id: string, agentId: string): Promise<{ complaint: Complaint }> {
    return request<{ complaint: Complaint }>(`/api/complaints/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ agentId }),
    });
  },

  async triggerEmergencyEscalation(payload: {
    complaintId?: string;
    reason: string;
    contactNumber?: string;
  }): Promise<{ complaint: Complaint }> {
    return request<{ complaint: Complaint }>('/api/complaints/escalate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Chat Messages
  async getMessages(complaintId: string): Promise<{ messages: ChatMessage[] }> {
    return request<{ messages: ChatMessage[] }>(`/api/messages/${complaintId}`);
  },

  async sendMessage(complaintId: string, message: string): Promise<{ message: ChatMessage }> {
    return request<{ message: ChatMessage }>(`/api/messages/${complaintId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Feedback
  async submitFeedback(complaintId: string, rating: number, comment?: string): Promise<{ feedback: Feedback }> {
    return request<{ feedback: Feedback }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ complaintId, rating, comment }),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PATCH',
    });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return request<AnalyticsData>('/api/analytics');
  },

  // Seed / Reset
  async seedDatabase(): Promise<{ message: string }> {
    return request<{ message: string }>('/api/seed', {
      method: 'POST',
    });
  },
};
