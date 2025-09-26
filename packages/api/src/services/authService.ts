// packages/api/src/services/authService.ts
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'resume.db');

export const authService = {
  async login(email: string, password: string): Promise<{ token: string } | null> {
    const db = new Database(DB_PATH, { readonly: true });
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
