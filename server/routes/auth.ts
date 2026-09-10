import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel, UserDoc } from '../models';
import { generateToken, authenticateToken, AuthRequest } from '../auth';

const router = Router();

// Register new user in MongoDB
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole: 'user' | 'agent' | 'admin' =
      role === 'agent' || role === 'admin' ? role : 'user';

    const newUserData: UserDoc = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: assignedRole,
      department: assignedRole === 'agent' ? 'Compliance' : 'General',
      title: assignedRole === 'agent' ? 'Support Agent' : 'Employee',
      avatar:
        assignedRole === 'agent'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfOAKN-gTqquyA3onLB_DCL9bnvXA_7zwKQwvhs1daCV_gzbMrMZrNhnP0gmSNevbw2qdfX-GL2_npCRhC4dcqW-wRs5P-FU-1H1KWuXdJFgBb1gm5bjXDHSyleQ76s-hCLH1Cqp4STi_xlkhWXfqfqFjn4VzetXwHxTi93TV6OscmTzXG3qtztIt8jPDPW6REb_K1R0IdrVT02hM6R4wHCuSyl-XH3cYlcEtJoskzfwyAj4SP-iY'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuATSxsxQQJQVOe4fe3qu82ylWcQEx1a7vBP0jy5kMNbvTeVf6SN8oGC31n5LBEvdhihadmUPRRM1QPwqOKrAR70gvsMYsVUnYnICSFpvIxjfMHALz39TEXqkCF5YUwXkZyMKrXKOc_kqra5JK1qDHcvVAdap5jtjUEMBHDVfV1wK8A3B4NkpoPUEP6L34MOOA-2-V2ZXK1AhX_w-T6MhBPnYj6OB3iVXqzacDpjZFZU4q1KL7N2YAIr',
      createdAt: new Date().toISOString(),
    };

    const createdUser = await UserModel.create(newUserData);
    const token = generateToken(createdUser);
    const { passwordHash: _, ...safeUser } = createdUser.toObject ? createdUser.toObject() : createdUser;

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail }).lean<UserDoc>();
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Current user profile
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// List all users
router.get('/users', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await UserModel.find({}, '-passwordHash').lean();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

// Demo account switch
router.post('/switch-demo', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    let user = await UserModel.findOne({ role }).lean<UserDoc>();
    if (!user) {
      user = await UserModel.findOne({}).lean<UserDoc>();
    }
    if (!user) {
      res.status(404).json({ error: 'No demo accounts found' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to switch demo role' });
  }
});

export default router;
