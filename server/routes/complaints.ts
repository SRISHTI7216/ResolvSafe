import { Router, Response } from 'express';
import {
  ComplaintModel,
  NotificationModel,
  UserModel,
  ComplaintDoc,
  TimelineDoc,
  UserDoc,
} from '../models';
import { authenticateToken, requireRole, AuthRequest } from '../auth';

const router = Router();

// GET all complaints (strictly scoped by role)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, department, search, priority, agentId } = req.query;
    const user = req.user;

    const filter: any = {};

    // Strict Role-Based Scoping
    if (user && user.role === 'user') {
      // User can only see their own complaints
      filter.$or = [{ 'submittedBy.id': user.id }, { 'submittedBy.email': user.email }];
    } else if (user && user.role === 'agent') {
      // Agent can only see complaints assigned to them
      filter['assignedAgent.id'] = user.id;
    } else if (user && user.role === 'admin') {
      // Admin sees all complaints (and can filter by agentId if specified)
      if (agentId) {
        filter['assignedAgent.id'] = String(agentId);
      }
    }

    if (status && status !== 'all') {
      filter.status = String(status);
    }

    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${String(category)}$`, 'i') };
    }

    if (department && department !== 'all') {
      filter.department = { $regex: new RegExp(`^${String(department)}$`, 'i') };
    }

    if (priority && priority !== 'all') {
      filter.priority = String(priority);
    }

    if (search) {
      const q = String(search).trim();
      const regex = new RegExp(q, 'i');
      const searchConditions = [
        { id: regex },
        { title: regex },
        { description: regex },
        { category: regex },
        { department: regex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const complaints = await ComplaintModel.find(filter).sort({ createdAt: -1 }).lean<ComplaintDoc[]>();
    res.json({ complaints });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch complaints' });
  }
});

// GET single complaint by ID (strictly authorized by role)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const complaint = await ComplaintModel.findOne({
      id: { $regex: new RegExp(`^${id}$`, 'i') },
    }).lean<ComplaintDoc>();

    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    const user = req.user;
    if (user && user.role === 'user') {
      const isOwner =
        complaint.submittedBy.id === user.id ||
        complaint.submittedBy.email.toLowerCase() === user.email.toLowerCase();
      if (!isOwner) {
        res.status(403).json({ error: 'Access denied: You can only view your own complaints.' });
        return;
      }
    } else if (user && user.role === 'agent') {
      const isAssigned = complaint.assignedAgent?.id === user.id;
      if (!isAssigned) {
        res.status(403).json({ error: 'Access denied: You can only view complaints assigned to you.' });
        return;
      }
    }
    // Admin is authorized to view any complaint

    res.json({ complaint });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch complaint' });
  }
});

// POST create complaint (standard users & admins)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (user && user.role === 'agent') {
      res.status(403).json({ error: 'Agents cannot submit complaints. Switch to user view to file complaints.' });
      return;
    }

    const {
      title,
      description,
      category,
      department,
      priority = 'medium',
      isAnonymous = false,
      attachments = [],
    } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ error: 'Title, description, and category are required.' });
      return;
    }

    const ticketSeq = 8000 + Math.floor(Math.random() * 1999);
    const newId = `CMP-2024-${ticketSeq}`;

    const initialTimeline: TimelineDoc[] = [
      {
        id: `tml-${Date.now()}`,
        title: 'Complaint Submitted',
        description: `System auto-generated ticket #${newId}.`,
        timestamp: 'Just now',
        type: 'created',
      },
    ];

    const newComplaintData: ComplaintDoc = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      department: department || 'General Services',
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      status: 'new',
      submittedBy: {
        id: user ? user.id : 'anon',
        name: isAnonymous ? 'Anonymous Employee' : user ? user.name : 'Guest User',
        email: user ? user.email : 'anonymous@internal.net',
        isAnonymous: !!isAnonymous,
      },
      assignedAgent: null,
      attachments: attachments.map((att: any, idx: number) => ({
        id: `att-${Date.now()}-${idx}`,
        name: att.name || `file_${idx + 1}.png`,
        size: att.size || '1.2 MB',
        type: att.type || 'image/png',
        url: att.url || '',
      })),
      timeline: initialTimeline,
      substatusNote: '',
      isAnonymous: !!isAnonymous,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdComplaint = await ComplaintModel.create(newComplaintData);

    // Create notification for submitter
    if (user) {
      await NotificationModel.create({
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: 'Complaint Logged',
        description: `Your complaint #${newId} was successfully submitted and queued for review.`,
        type: 'complaint_received',
        read: false,
        timestamp: 'Just now',
        complaintId: newId,
      });
    }

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: createdComplaint,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit complaint' });
  }
});

// PATCH update status (agents can only update their assigned tickets; admins can update any; users cannot update status)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const user = req.user;

    if (user && user.role === 'user') {
      res.status(403).json({ error: 'Forbidden: Standard users cannot alter complaint status.' });
      return;
    }

    const complaint = await ComplaintModel.findOne({
      id: { $regex: new RegExp(`^${id}$`, 'i') },
    });
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    if (user && user.role === 'agent') {
      if (complaint.assignedAgent?.id !== user.id) {
        res.status(403).json({ error: 'Forbidden: Agents can only update complaints assigned to them.' });
        return;
      }
    }

    complaint.status = status;
    if (note) {
      complaint.substatusNote = note;
    }
    complaint.updatedAt = new Date().toISOString();

    const statusLabels: Record<string, string> = {
      new: 'New',
      in_progress: 'In Progress',
      pending_info: 'Pending Info',
      resolved: 'Resolved',
      rejected: 'Rejected',
    };

    complaint.timeline.unshift({
      id: `tml-${Date.now()}`,
      title: `Status changed to ${statusLabels[status] || status}`,
      description: note || `Updated by ${user ? user.name : 'System'}.`,
      timestamp: 'Just now',
      actor: user
        ? {
            name: user.name,
            role: user.title || user.role,
            avatar: user.avatar,
          }
        : undefined,
      type: 'status',
    });

    await complaint.save();

    // Notify submitter
    if (complaint.submittedBy?.id) {
      await NotificationModel.create({
        id: `notif-${Date.now()}`,
        userId: complaint.submittedBy.id,
        title: 'Status Updated',
        description: `Ticket #${complaint.id} status is now ${statusLabels[status] || status}.`,
        type: 'status_updated',
        read: false,
        timestamp: 'Just now',
        complaintId: complaint.id,
      });
    }

    res.json({ complaint });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

// PATCH assign agent (strictly admin only)
router.patch('/:id/assign', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const complaint = await ComplaintModel.findOne({
      id: { $regex: new RegExp(`^${id}$`, 'i') },
    });
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    const agent = await UserModel.findOne({ id: agentId }).lean<UserDoc>();
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    complaint.assignedAgent = {
      id: agent.id,
      name: agent.name,
      role: agent.title || 'Senior Safety Liaison',
      email: agent.email,
      phone: agent.phone || '+1 (555) 890-1234',
      avatar: agent.avatar,
      department: agent.department,
      avgResponseTime: '1.2 hrs',
    };

    complaint.timeline.unshift({
      id: `tml-${Date.now()}`,
      title: `Assigned to ${agent.name}`,
      description: `Ticket assigned to ${agent.name} (${agent.title || 'Agent'}).`,
      timestamp: 'Just now',
      actor: {
        name: req.user ? req.user.name : 'System Admin',
        role: 'Administrator',
      },
      type: 'assigned',
    });

    await complaint.save();

    if (complaint.submittedBy?.id) {
      await NotificationModel.create({
        id: `notif-${Date.now()}`,
        userId: complaint.submittedBy.id,
        title: 'Agent Assigned',
        description: `${agent.name} has been assigned to your complaint #${complaint.id}.`,
        type: 'agent_assigned',
        read: false,
        timestamp: 'Just now',
        complaintId: complaint.id,
      });
    }

    res.json({ complaint });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to assign agent' });
  }
});

// POST emergency escalation
router.post('/escalate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { complaintId, reason, contactNumber } = req.body;
    const user = req.user;

    let complaint = complaintId
      ? await ComplaintModel.findOne({ id: { $regex: new RegExp(`^${complaintId}$`, 'i') } })
      : null;

    if (!complaint) {
      const newId = `CMP-2024-EMERG-${Math.floor(100 + Math.random() * 899)}`;
      complaint = await ComplaintModel.create({
        id: newId,
        title: `EMERGENCY ESCALATION: ${reason || 'Immediate Safety / Legal Concern'}`,
        description: `Critical emergency escalation reported by ${user ? user.name : 'Employee'}. Contact: ${contactNumber || 'On file'}. Details: ${reason}`,
        category: 'Safety & Emergency',
        department: 'Facilities & Security',
        priority: 'urgent',
        status: 'in_progress',
        submittedBy: {
          id: user ? user.id : 'anon',
          name: user ? user.name : 'Anonymous Reporter',
          email: user ? user.email : 'safety@internal.net',
          isAnonymous: false,
        },
        assignedAgent: {
          id: 'usr-marcus',
          name: 'Marcus T.',
          role: 'Senior Safety Liaison',
          email: 'marcus.t@resolvsafe.internal',
          phone: '+1 (555) 890-1234',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfOAKN-gTqquyA3onLB_DCL9bnvXA_7zwKQwvhs1daCV_gzbMrMZrNhnP0gmSNevbw2qdfX-GL2_npCRhC4dcqW-wRs5P-FU-1H1KWuXdJFgBb1gm5bjXDHSyleQ76s-hCLH1Cqp4STi_xlkhWXfqfqFjn4VzetXwHxTi93TV6OscmTzXG3qtztIt8jPDPW6REb_K1R0IdrVT02hM6R4wHCuSyl-XH3cYlcEtJoskzfwyAj4SP-iY',
          department: 'Facilities Mgmt',
          avgResponseTime: 'Immediate',
        },
        attachments: [],
        timeline: [
          {
            id: `tml-${Date.now()}`,
            title: '🚨 Emergency Escalation Triggered',
            description: 'High-priority dispatch triggered. On-call executive response team alerted.',
            timestamp: 'Just now',
            type: 'escalated',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      complaint.priority = 'urgent';
      complaint.timeline.unshift({
        id: `tml-${Date.now()}`,
        title: '🚨 Emergency Escalation Triggered',
        description: reason || 'Escalated to critical priority tier.',
        timestamp: 'Just now',
        type: 'escalated',
      });
      await complaint.save();
    }

    // Add notification to all admins and agents
    const staff = await UserModel.find({ role: { $in: ['admin', 'agent'] } }).lean<UserDoc[]>();
    const notifDocs = staff.map((admin) => ({
      id: `notif-emerg-${Date.now()}-${admin.id}`,
      userId: admin.id,
      title: '🚨 CRITICAL ESCALATION',
      description: `Ticket #${complaint?.id} was flagged for emergency attention.`,
      type: 'emergency' as const,
      read: false,
      timestamp: 'Just now',
      complaintId: complaint?.id,
    }));

    if (notifDocs.length > 0) {
      await NotificationModel.insertMany(notifDocs);
    }

    res.json({ message: 'Emergency escalation dispatched', complaint });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch escalation' });
  }
});

export default router;
