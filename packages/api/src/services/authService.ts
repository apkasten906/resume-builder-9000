// packages/api/src/services/authService.ts
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { connectDatabase } from '../db.js';
import { evaluatePassword } from '@rb9k/core';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

// In-memory blacklist for JWT tokens (for demo/dev only; use persistent store for prod)
const jwtBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  jwtBlacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return jwtBlacklist.has(token);
}

// User row interface for database queries
interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('Email already registered');
    this.name = 'DuplicateEmailError';
  }
}

export class PasswordPolicyError extends Error {
  readonly unmetRequirements: readonly string[];

  constructor(unmetRequirements: readonly string[]) {
    super('Password does not meet security requirements');
    this.name = 'PasswordPolicyError';
    this.unmetRequirements = unmetRequirements;
  }
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly name?: string;
}

function mapRowToUser(row: Pick<UserRow, 'id' | 'email' | 'name'>): AuthenticatedUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? undefined,
  };
}

function createToken(user: Pick<AuthenticatedUser, 'id' | 'email'>): string {
  return jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
}

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: AuthenticatedUser } | null> {
    // Get database connection from shared pool
    const db = connectDatabase();

    // Use prepared statement for security (prevent SQL injection)
    const user = db
      .prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?')
      .get(email) as UserRow | undefined;

    if (!user) {
      return null; // User not found
    }

    // Verify password with bcrypt
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return null; // Password doesn't match
    }

    // Generate JWT token with user info
    const profile = mapRowToUser(user);
    const token = createToken(profile);

    return { token, user: profile };
  },
  async register({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name?: string | null;
  }): Promise<{ token: string; user: AuthenticatedUser }> {
    const db = connectDatabase();

    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email) as { id: string } | undefined;

    if (existing) {
      throw new DuplicateEmailError();
    }

    const evaluation = evaluatePassword(password);
    if (!evaluation.valid) {
      const unmet = evaluation.requirements.filter(req => !req.met).map(req => req.id);
      throw new PasswordPolicyError(unmet);
    }

    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const trimmedName = name?.trim() || null;
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)' 
    ).run(userId, email, hashedPassword, trimmedName, createdAt);

    const user = mapRowToUser({ id: userId, email, name: trimmedName });
    const token = createToken(user);

    return { token, user };
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
      const db = connectDatabase();
      const user = db
        .prepare('SELECT id, email, name FROM users WHERE id = ?')
        .get(payload.sub) as Pick<UserRow, 'id' | 'email' | 'name'> | undefined;

      if (!user) {
        return null;
      }

      return mapRowToUser(user);
    } catch {
      return null;
    }
  },
};
