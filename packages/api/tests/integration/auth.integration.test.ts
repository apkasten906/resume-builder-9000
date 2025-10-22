import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcryptjs';

import authRoutes from '../../src/routes/auth.js';
import { connectDatabase, closeDatabase } from '../../src/db.js';
import { clearEmailOutbox, getEmailOutbox } from '../../src/services/emailService.js';

function createTestApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  return app;
}

describe('POST /auth/register', () => {
  beforeEach(async () => {
    process.env.DB_PATH = ':memory:';
    process.env.WEB_BASE = 'http://localhost:3000';
    const db = connectDatabase();
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM email_verification_tokens').run();
    clearEmailOutbox();

    const passwordHash = await bcrypt.hash('ValidPassword1!', 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, created_at, email_confirmed, email_confirmed_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
    ).run(
      'existing-user',
      'user@example.com',
      passwordHash,
      'Existing User',
      new Date().toISOString(),
      new Date().toISOString()
    );
  });

  afterEach(() => {
    closeDatabase();
    delete process.env.DB_PATH;
    delete process.env.WEB_BASE;
    clearEmailOutbox();
  });

  it('registers a new user and returns verification metadata', async () => {
    const app = createTestApp();

    const response = await request(app).post('/auth/register').send({
      email: 'integration@example.com',
      password: 'ValidPassword1!',
      confirmPassword: 'ValidPassword1!',
      fullName: 'Integration Test',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      ok: true,
      user: { email: 'integration@example.com', name: 'Integration Test' },
      requiresEmailConfirmation: true,
    });
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(typeof response.body.verification?.expiresAt).toBe('string');

    const outbox = getEmailOutbox();
    expect(outbox.length).toBeGreaterThan(0);

    const db = connectDatabase();
    const stored = db
      .prepare('SELECT email, name, email_confirmed FROM users WHERE email = ?')
      .get('integration@example.com') as
      | { email: string; name: string | null; email_confirmed: number }
      | undefined;
    expect(stored).toEqual({
      email: 'integration@example.com',
      name: 'Integration Test',
      email_confirmed: 0,
    });
  });

  it('rejects duplicate emails with a 409 response', async () => {
    const app = createTestApp();

    const response = await request(app).post('/auth/register').send({
      email: 'user@example.com',
      password: 'ValidPassword1!',
      confirmPassword: 'ValidPassword1!',
      fullName: 'Existing User',
    });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/email already registered/i);
  });

  it('returns validation details for weak passwords', async () => {
    const app = createTestApp();

    const response = await request(app).post('/auth/register').send({
      email: 'weak@example.com',
      password: 'password',
      confirmPassword: 'password',
      fullName: 'Weak Password',
    });

    expect(response.status).toBe(400);
    expect(response.body.field).toBe('password');
    expect(Array.isArray(response.body.unmet)).toBe(true);
    expect(response.body.unmet.length).toBeGreaterThan(0);
  });

  it('verifies an email token and issues a session cookie', async () => {
    const app = createTestApp();

    await request(app).post('/auth/register').send({
      email: 'verify-me@example.com',
      password: 'ValidPassword1!',
      confirmPassword: 'ValidPassword1!',
      fullName: 'Verify Integration',
    });

    const outbox = getEmailOutbox();
    const latest = outbox[outbox.length - 1];
    const token = String(latest.metadata?.token ?? '');

    const response = await request(app).post('/auth/verify-email').send({ token });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      user: { email: 'verify-me@example.com' },
    });
    expect(response.headers['set-cookie']).toBeTruthy();

    const db = connectDatabase();
    const stored = db
      .prepare('SELECT email_confirmed FROM users WHERE email = ?')
      .get('verify-me@example.com') as { email_confirmed: number };
    expect(stored.email_confirmed).toBe(1);
  });
});
