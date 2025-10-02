// packages/api/src/services/authService.ts
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../db.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

// In-memory blacklist for JWT tokens (for demo/dev only; use persistent store for prod)
const jwtBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  jwtBlacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return jwtBlacklist.has(token);
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string } | null> {
    // Get database connection from shared pool
    const db = connectDatabase();

    // Use prepared statement for security (prevent SQL injection)
    const user = db
      .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
      .get(email);

    if (!user) {
      return null; // User not found
    }

    // Verify password with bcrypt
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return null; // Password doesn't match
    }

    // Generate JWT token with user info
    const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });

    return { token };
  },
  async getUserFromRequest(
    req: Request
  ): Promise<{ id: string; email: string; name?: string } | null> {
    const token = req.cookies?.session || req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
      if (isTokenBlacklisted(token)) {
        return null;
      }
      const payload = jwt.verify(token, SECRET) as { sub: string; email: string };
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  },
};
