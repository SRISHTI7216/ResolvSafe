import { Router, Response } from 'express';
import { NotificationModel, NotificationDoc } from '../models';
import { authenticateToken, AuthRequest } from '../auth';

const router = Router();

// GET notifications for current user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const filter = user && user.role !== 'admin' ? { userId: user.id } : {};
    const notifications = await NotificationModel.find(filter)
      .sort({ _id: -1 })
      .lean<NotificationDoc[]>();
    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

// Mark one notification as read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await NotificationModel.updateOne({ id }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notification' });
  }
});

// Mark all as read
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const filter = user && user.role !== 'admin' ? { userId: user.id } : {};
    await NotificationModel.updateMany(filter, { $set: { read: true } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notifications' });
  }
});

export default router;
