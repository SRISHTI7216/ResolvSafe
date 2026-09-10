import mongoose, { Schema, Model, Document } from 'mongoose';

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'user' | 'agent' | 'admin';
  department: string;
  title: string;
  avatar: string;
  createdAt: string;
}

export interface AttachmentDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface TimelineDoc {
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

export interface ComplaintDoc {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'pending' | 'in_progress' | 'pending_info' | 'resolved' | 'rejected';
  submittedBy: {
    id: string;
    name: string;
    email: string;
    isAnonymous?: boolean;
  };
  assignedAgent: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
    department: string;
    avgResponseTime: string;
  } | null;
  attachments: AttachmentDoc[];
  timeline: TimelineDoc[];
  substatusNote?: string;
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDoc {
  id: string;
  complaintId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'agent' | 'admin' | 'system';
  senderAvatar?: string;
  message: string;
  timestamp: string;
}

export interface FeedbackDoc {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationDoc {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'agent_assigned' | 'status_updated' | 'complaint_received' | 'emergency';
  read: boolean;
  timestamp: string;
  complaintId?: string;
}

// User Schema
const UserSchema = new Schema<UserDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
    department: { type: String, default: 'General' },
    title: { type: String, default: 'Employee' },
    avatar: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { versionKey: false }
);

// Complaint Schema
const ComplaintSchema = new Schema<ComplaintDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Other' },
    department: { type: String, default: 'General Services' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: {
      type: String,
      enum: ['new', 'pending', 'in_progress', 'pending_info', 'resolved', 'rejected'],
      default: 'new',
    },
    submittedBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      isAnonymous: { type: Boolean, default: false },
    },
    assignedAgent: {
      id: String,
      name: String,
      role: String,
      email: String,
      phone: String,
      avatar: String,
      department: String,
      avgResponseTime: String,
    },
    attachments: [
      {
        id: String,
        name: String,
        size: String,
        type: { type: String },
        url: String,
      },
    ],
    timeline: [
      {
        id: String,
        title: String,
        description: String,
        timestamp: String,
        actor: {
          name: String,
          role: String,
          avatar: String,
        },
        type: { type: String },
      },
    ],
    substatusNote: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { versionKey: false }
);

// Chat Message Schema
const ChatMessageSchema = new Schema<ChatMessageDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    complaintId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['user', 'agent', 'admin', 'system'], default: 'user' },
    senderAvatar: { type: String, default: '' },
    message: { type: String, required: true },
    timestamp: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  },
  { versionKey: false }
);

// Feedback Schema
const FeedbackSchema = new Schema<FeedbackDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    complaintId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { versionKey: false }
);

// Notification Schema
const NotificationSchema = new Schema<NotificationDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['agent_assigned', 'status_updated', 'complaint_received', 'emergency'],
      default: 'status_updated',
    },
    read: { type: Boolean, default: false },
    timestamp: { type: String, default: 'Just now' },
    complaintId: { type: String },
  },
  { versionKey: false }
);

export const UserModel: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>('User', UserSchema);
export const ComplaintModel: Model<ComplaintDoc> =
  (mongoose.models.Complaint as Model<ComplaintDoc>) ||
  mongoose.model<ComplaintDoc>('Complaint', ComplaintSchema);
export const ChatMessageModel: Model<ChatMessageDoc> =
  (mongoose.models.ChatMessage as Model<ChatMessageDoc>) ||
  mongoose.model<ChatMessageDoc>('ChatMessage', ChatMessageSchema);
export const FeedbackModel: Model<FeedbackDoc> =
  (mongoose.models.Feedback as Model<FeedbackDoc>) ||
  mongoose.model<FeedbackDoc>('Feedback', FeedbackSchema);
export const NotificationModel: Model<NotificationDoc> =
  (mongoose.models.Notification as Model<NotificationDoc>) ||
  mongoose.model<NotificationDoc>('Notification', NotificationSchema);
