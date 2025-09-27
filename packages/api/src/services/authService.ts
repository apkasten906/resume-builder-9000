// packages/api/src/services/authService.ts
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../db.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string } | null> {
    const db = connectDatabase();
    const user = db
      .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
      .get(email);
    db.close();
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;
    const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    return { token };
  },
  async getUserFromRequest(
    req: Request
  ): Promise<{ id: string; email: string; name?: string } | null> {
    const token = req.cookies?.session || req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
      const payload = jwt.verify(token, SECRET) as { sub: string; email: string };
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  },
};
