import { Router, Response } from 'express';
import { ChatMessageModel, ComplaintModel, ChatMessageDoc } from '../models';
import { authenticateToken, AuthRequest } from '../auth';

const router = Router();

// GET messages for complaint (role-scoped)
router.get('/:complaintId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { complaintId } = req.params;
    const user = req.user;

    const complaint = await ComplaintModel.findOne({
      id: { $regex: new RegExp(`^${complaintId}$`, 'i') },
    });
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    if (user && user.role === 'user') {
      const isOwner =
        complaint.submittedBy.id === user.id ||
        complaint.submittedBy.email.toLowerCase() === user.email.toLowerCase();
      if (!isOwner) {
        res.status(403).json({ error: 'Access denied: You can only view chat for your own complaints.' });
        return;
      }
    } else if (user && user.role === 'agent') {
      if (complaint.assignedAgent?.id !== user.id) {
        res.status(403).json({ error: 'Access denied: You can only view chat for complaints assigned to you.' });
        return;
      }
    }

    const messages = await ChatMessageModel.find({
      complaintId: { $regex: new RegExp(`^${complaintId}$`, 'i') },
    })
      .sort({ _id: 1 })
      .lean<ChatMessageDoc[]>();

    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
});

// POST send message (role-scoped)
router.post('/:complaintId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { complaintId } = req.params;
    const { message } = req.body;
    const user = req.user;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty' });
      return;
    }

    const complaint = await ComplaintModel.findOne({
      id: { $regex: new RegExp(`^${complaintId}$`, 'i') },
    });
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    if (user && user.role === 'user') {
      const isOwner =
        complaint.submittedBy.id === user.id ||
        complaint.submittedBy.email.toLowerCase() === user.email.toLowerCase();
      if (!isOwner) {
        res.status(403).json({ error: 'Access denied: You can only post messages on your own complaints.' });
        return;
      }
    } else if (user && user.role === 'agent') {
      if (complaint.assignedAgent?.id !== user.id) {
        res.status(403).json({ error: 'Access denied: You can only post messages on complaints assigned to you.' });
        return;
      }
    }

    const newMsgData: ChatMessageDoc = {
      id: `msg-${Date.now()}`,
      complaintId,
      senderId: user ? user.id : 'usr-alex',
      senderName: user ? user.name : 'User',
      senderRole: user ? user.role : 'user',
      senderAvatar: user?.avatar || '',
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMsg = await ChatMessageModel.create(newMsgData);
    res.status(201).json({ message: newMsg });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send message' });
  }
});

export default router;
