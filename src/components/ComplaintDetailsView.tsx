import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Printer,
  Share2,
  Download,
  Eye,
  Send,
  Shield,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  Check,
} from 'lucide-react';
import { Complaint, ChatMessage, ComplaintStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ComplaintDetailsViewProps {
  complaintId: string;
  onBack: () => void;
  onOpenFeedback: (complaintId: string) => void;
}

export const ComplaintDetailsView: React.FC<ComplaintDetailsViewProps> = ({
  complaintId,
  onBack,
  onOpenFeedback,
}) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load complaint data
  const loadData = async () => {
    try {
      const [compRes, msgRes] = await Promise.all([
        api.getComplaint(complaintId),
        api.getMessages(complaintId),
      ]);
      setComplaint(compRes.complaint);
      setMessages(msgRes.messages);
    } catch (err) {
      console.error('Failed to load complaint detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      api.getMessages(complaintId).then((res) => {
        setMessages(res.messages);
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [complaintId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.sendMessage(complaintId, inputMessage.trim());
      setMessages((prev) => [...prev, res.message]);
      setInputMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (nextStatus: ComplaintStatus) => {
    if (!complaint) return;
    setStatusUpdating(true);
    try {
      const res = await api.updateComplaintStatus(complaint.id, nextStatus);
      setComplaint(res.complaint);
      if (nextStatus === 'resolved') {
        onOpenFeedback(complaint.id);
      }
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading || !complaint) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00288e] border-t-transparent" />
      </div>
    );
  }

  const agent = complaint.assignedAgent || {
    id: 'agent-fallback',
    name: 'Marcus T.',
    role: 'Senior Safety Liaison',
    email: 'marcus.t@resolvsafe.internal',
    phone: '+1 (555) 890-1234',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfOAKN-gTqquyA3onLB_DCL9bnvXA_7zwKQwvhs1daCV_gzbMrMZrNhnP0gmSNevbw2qdfX-GL2_npCRhC4dcqW-wRs5P-FU-1H1KWuXdJFgBb1gm5bjXDHSyleQ76s-hCLH1Cqp4STi_xlkhWXfqfqFjn4VzetXwHxTi93TV6OscmTzXG3qtztIt8jPDPW6REb_K1R0IdrVT02hM6R4wHCuSyl-XH3cYlcEtJoskzfwyAj4SP-iY',
    department: 'Facilities Mgmt',
    avgResponseTime: '1.2 hrs',
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00288e] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Complaints</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Ticket Header (matching Screenshot 11) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-base font-bold text-[#00288e]">
              #{complaint.id}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00288e] border border-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00288e]" />
              {complaint.status.replace('_', ' ')}
            </span>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-700 border border-rose-200">
              {complaint.priority}
            </span>
          </div>

          {/* Quick status dropdown for Agents/Admins */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Update Status:</span>
            <select
              value={complaint.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusUpdate(e.target.value as ComplaintStatus)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:border-[#00288e] focus:outline-hidden"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_info">Pending Info</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">{complaint.title}</h1>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50/70 p-4 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Submitted By</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              {complaint.submittedBy.isAnonymous ? (
                <>
                  <Shield className="h-3.5 w-3.5 text-[#00288e]" />
                  <span>Anonymous Employee</span>
                </>
              ) : (
                <span>{complaint.submittedBy.name}</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Department</span>
            <span className="font-semibold text-slate-800">{complaint.department}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Date Submitted</span>
            <span className="font-semibold text-slate-800">
              {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left 8/12 + Right 4/12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Complaint Details & Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Details Narrative */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Complaint Details
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {complaint.description}
            </p>

            {/* Attachments Section */}
            {complaint.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Attachments ({complaint.attachments.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {complaint.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Paperclip className="h-4 w-4 text-[#00288e] shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-800 truncate">
                            {att.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{att.size}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => alert(`Opening preview of ${att.name}`)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading ${att.name}`)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline matching Screenshot 11 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Activity Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative group">
                  <div className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-[#00288e]/10">
                    <span className="h-2 w-2 rounded-full bg-[#00288e]" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
                      <span className="text-[10px] font-medium text-slate-400">
                        {event.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                    {event.actor && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        {event.actor.avatar && (
                          <img
                            src={event.actor.avatar}
                            alt=""
                            className="h-4 w-4 rounded-full object-cover"
                          />
                        )}
                        <span>{event.actor.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Agent & Live Chat */}
        <div className="lg:col-span-5 space-y-6">
          {/* Assigned Agent Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Assigned Agent</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Online
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={agent.avatar}
                alt={agent.name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
              />
              <div>
                <div className="font-bold text-sm text-slate-900">{agent.name}</div>
                <div className="text-xs text-[#00288e] font-medium">{agent.role}</div>
                <div className="text-[11px] text-slate-400">{agent.department}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`mailto:${agent.email}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email</span>
              </a>
              <a
                href={`tel:${agent.phone}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call</span>
              </a>
            </div>

            <div className="rounded-xl bg-blue-50/60 p-2.5 border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
              <span>Avg Response Time:</span>
              <span className="font-bold">{agent.avgResponseTime || '1.2 hrs'}</span>
            </div>
          </div>

          {/* Live Communication Chat Box (matching Screenshot 11) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-[480px]">
            <div className="border-b border-slate-100 p-4 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Live Communication</h3>
                <p className="text-[10px] text-slate-400">Direct message channel with assigned agent</p>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#f8f9ff]/50">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-slate-400 text-xs">
                  No messages yet. Send an inquiry below to notify the assigned specialist.
                </div>
              ) : (
                messages.map((msg) => {
                  const isUserSender = msg.senderId === user?.id || msg.senderRole === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUserSender ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed ${
                          isUserSender
                            ? 'bg-[#00288e] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-3 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message or update..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:bg-white focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="rounded-xl bg-[#00288e] px-3.5 py-2 text-white hover:bg-[#00288e]/90 disabled:opacity-40 transition-colors shadow-2xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Close & Review Button */}
          {complaint.status !== 'resolved' && (
            <button
              type="button"
              onClick={() => handleStatusUpdate('resolved')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark as Resolved & Leave Feedback</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
