// packages/api/src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await authService.getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  (req as unknown as { user: typeof user }).user = user;
  next();
}
