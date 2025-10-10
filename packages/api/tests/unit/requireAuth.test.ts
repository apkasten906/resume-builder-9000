import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';

import { requireAuth } from '../../src/middleware/requireAuth.js';
import { authService } from '../../src/services/authService.js';
import { connectDatabase, closeDatabase } from '../../src/db.js';

function createMockResponse(): Response & { statusCode?: number; body?: unknown } {
  const res: Partial<Response & { statusCode?: number; body?: unknown }> = {};
  res.status = function status(code: number) {
    res.statusCode = code;
    return res as Response;
  } as Response['status'];
  res.json = function json(payload: unknown) {
    res.body = payload;
    return res as Response;
  } as Response['json'];
  return res as Response & { statusCode?: number; body?: unknown };
}

function createMockRequest(token?: string): Request {
  return {
    cookies: token ? { session: token } : {},
    headers: token ? { authorization: `Bearer ${token}` } : {},
  } as unknown as Request;
}

describe('requireAuth middleware', () => {
  const password = 'ValidPassword1!';

  beforeEach(async () => {
    process.env.DB_PATH = ':memory:';
    const db = connectDatabase();
    db.prepare('DELETE FROM users').run();

    const hash = await bcrypt.hash(password, 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, created_at, email_confirmed, email_confirmed_at) VALUES (?, ?, ?, ?, ?, 1, ?)' 
    ).run('user-id', 'user@example.com', hash, 'Test User', new Date().toISOString(), new Date().toISOString());
  });

  afterEach(() => {
    closeDatabase();
    delete process.env.DB_PATH;
  });

  it('rejects unauthenticated requests', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next: NextFunction = () => {
      throw new Error('next should not be called');
    };

    await requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({ error: 'Unauthorized' });
  });

  it('allows requests with a valid session token', async () => {
    const login = await authService.login('user@example.com', password);
    expect(login).toBeTruthy();

    const req = createMockRequest(login?.token);
    const res = createMockResponse();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(res.statusCode ?? 200).toBe(200);
  });
});

