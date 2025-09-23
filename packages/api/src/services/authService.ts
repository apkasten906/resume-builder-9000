// packages/api/src/services/authService.ts
import jwt from 'jsonwebtoken';
import type { Request } from 'express';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

const demoUser = { id: 'u_1', email: 'user@example.com', name: 'Demo User' };

export const authService = {
  async login(email: string, password: string): Promise<{ token: string } | null> {
    if (email === 'user@example.com' && password === 'ValidPassword1!') {
      const token = jwt.sign({ sub: demoUser.id, email: demoUser.email }, SECRET, {
        expiresIn: '7d',
      });
      return { token };
    }
    return null;
  },
  async getUserFromRequest(
    req: Request
  ): Promise<{ id: string; email: string; name: string } | null> {
    const token = req.cookies?.session || req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
      const payload = jwt.verify(token, SECRET) as { sub: string; email: string };
      return { id: payload.sub, email: payload.email, name: demoUser.name };
    } catch {
      return null;
    }
  },
};
