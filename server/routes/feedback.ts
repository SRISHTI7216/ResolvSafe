import { Router, Response } from 'express';
import { FeedbackModel, FeedbackDoc } from '../models';
import { authenticateToken, AuthRequest } from '../auth';

const router = Router();

// GET all feedback
router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const feedback = await FeedbackModel.find().sort({ createdAt: -1 }).lean<FeedbackDoc[]>();
    res.json({ feedback });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch feedback' });
  }
});

// POST submit feedback
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { complaintId, rating, comment } = req.body;
    const user = req.user;

    if (!complaintId || typeof rating !== 'number') {
      res.status(400).json({ error: 'Complaint ID and numeric rating are required' });
      return;
    }

    const newFeedbackData: FeedbackDoc = {
      id: `fb-${Date.now()}`,
      complaintId,
      userId: user ? user.id : 'usr-alex',
      userName: user ? user.name : 'Anonymous Employee',
      rating: Math.min(5, Math.max(1, rating)),
      comment: (comment || '').trim(),
      createdAt: new Date().toISOString(),
    };

    const newFeedback = await FeedbackModel.create(newFeedbackData);
    res.status(201).json({ message: 'Thank you for your feedback!', feedback: newFeedback });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit feedback' });
  }
});

export default router;
