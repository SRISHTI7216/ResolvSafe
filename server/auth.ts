import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, UserDoc } from './models';

const JWT_SECRET = process.env.JWT_SECRET || 'resolvsafe-production-jwt-secret-key-2026';

export interface AuthRequest extends Request {
  user?: UserDoc;
}

export function generateToken(user: UserDoc): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    // If no token, check if a demo user header was passed (for testing convenience)
    const demoUserId = req.headers['x-demo-user-id'] as string;
    if (demoUserId) {
      try {
        const demoUser = await UserModel.findOne({ id: demoUserId }).lean<UserDoc>();
        if (demoUser) {
          req.user = demoUser;
          return next();
        }
      } catch {
        // fall through
      }
    }

    res.status(401).json({ error: 'Authentication token required. Please sign in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await UserModel.findOne({ id: decoded.id }).lean<UserDoc>();
    if (!user) {
      res.status(401).json({ error: 'User not found or account removed.' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: Array<'user' | 'agent' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: role '${req.user.role}' is not authorized. Allowed: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    next();
  };
}
