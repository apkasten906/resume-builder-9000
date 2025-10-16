// packages/api/src/services/authService.ts
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { connectDatabase } from '../db.js';
import { evaluatePassword } from '@rb9k/core';
import { sendVerificationEmail } from './emailService.js';

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
  email_confirmed: number;
  email_confirmed_at: string | null;
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

export class EmailNotConfirmedError extends Error {
  readonly email: string;

  constructor(email: string) {
    super('Email not confirmed');
    this.name = 'EmailNotConfirmedError';
    this.email = email;
  }
}

export class InvalidVerificationTokenError extends Error {
  constructor() {
    super('Invalid verification token');
    this.name = 'InvalidVerificationTokenError';
  }
}

export class ExpiredVerificationTokenError extends Error {
  constructor() {
    super('Verification token has expired');
    this.name = 'ExpiredVerificationTokenError';
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

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_TOKEN_TTL_MINUTES = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES ?? '30');

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function hashVerificationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function createVerificationRecord(): {
  token: string;
  tokenHash: string;
  expiresAt: string;
} {
  const token = randomBytes(VERIFICATION_TOKEN_BYTES).toString('hex');
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
  return { token, tokenHash, expiresAt };
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
      .prepare(
        'SELECT id, email, password_hash, name, email_confirmed, email_confirmed_at FROM users WHERE email = ?'
      )
      .get(email) as UserRow | undefined;

    if (!user) {
      return null; // User not found
    }

    // Verify password with bcrypt
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return null; // Password doesn't match
    }

    if (!user.email_confirmed) {
      throw new EmailNotConfirmedError(user.email);
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
  }): Promise<{
    user: AuthenticatedUser;
    verification: { sentTo: string; expiresAt: string };
  }> {
    const db = connectDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
      | { id: string }
      | undefined;

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
      'INSERT INTO users (id, email, password_hash, name, created_at, email_confirmed, email_confirmed_at) VALUES (?, ?, ?, ?, ?, 0, NULL)'
    ).run(userId, email, hashedPassword, trimmedName, createdAt);

    const user = mapRowToUser({ id: userId, email, name: trimmedName });
    const verification = createVerificationRecord();

    db.prepare(
      'INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(randomUUID(), userId, verification.tokenHash, verification.expiresAt, createdAt);

    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${normalizeBaseUrl(appBaseUrl)}/confirm-email?token=${verification.token}`;

    await sendVerificationEmail({
      to: email,
      verificationUrl,
      expiresAt: verification.expiresAt,
      token: verification.token,
    });

    return { user, verification: { sentTo: email, expiresAt: verification.expiresAt } };
  },
  async resendVerification(email: string): Promise<{ sentTo: string; expiresAt: string }> {
    const db = connectDatabase();

    const user = db.prepare('SELECT id, email_confirmed FROM users WHERE email = ?').get(email) as
      | { id: string; email_confirmed: number }
      | undefined;

    if (!user) {
      throw new Error('User not found');
    }

    if (user.email_confirmed) {
      throw new Error('Email already confirmed');
    }

    const verification = createVerificationRecord();
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(randomUUID(), user.id, verification.tokenHash, verification.expiresAt, createdAt);

    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${normalizeBaseUrl(appBaseUrl)}/confirm-email?token=${verification.token}`;

    await sendVerificationEmail({
      to: email,
      verificationUrl,
      expiresAt: verification.expiresAt,
      token: verification.token,
    });

    return { sentTo: email, expiresAt: verification.expiresAt };
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
        .prepare('SELECT id, email, name FROM users WHERE id = ? AND email_confirmed = 1')
        .get(payload.sub) as Pick<UserRow, 'id' | 'email' | 'name'> | undefined;

      if (!user) {
        return null;
      }

      return mapRowToUser(user);
    } catch {
      return null;
    }
  },
  async verifyEmail(token: string): Promise<{ token: string; user: AuthenticatedUser }> {
    if (!token) {
      throw new InvalidVerificationTokenError();
    }

    const db = connectDatabase();
    const tokenHash = hashVerificationToken(token);

    const record = db
      .prepare(
        `SELECT evt.id as token_id, evt.user_id, evt.expires_at, u.email, u.name, u.email_confirmed
         FROM email_verification_tokens evt
         JOIN users u ON u.id = evt.user_id
         WHERE evt.token_hash = ?`
      )
      .get(tokenHash) as
      | {
          token_id: string;
          user_id: string;
          expires_at: string;
          email: string;
          name: string | null;
          email_confirmed: number;
        }
      | undefined;

    if (!record) {
      throw new InvalidVerificationTokenError();
    }

    const now = Date.now();
    if (new Date(record.expires_at).getTime() < now) {
      db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').run(record.user_id);
      throw new ExpiredVerificationTokenError();
    }

    if (!record.email_confirmed) {
      const confirmedAt = new Date().toISOString();
      db.prepare('UPDATE users SET email_confirmed = 1, email_confirmed_at = ? WHERE id = ?').run(
        confirmedAt,
        record.user_id
      );
    }

    db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?').run(record.user_id);

    const user = mapRowToUser({ id: record.user_id, email: record.email, name: record.name });
    const sessionToken = createToken(user);

    return { token: sessionToken, user };
  },
};
