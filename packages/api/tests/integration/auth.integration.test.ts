import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcryptjs';

import authRoutes from '../../src/routes/auth.js';
import { connectDatabase, closeDatabase } from '../../src/db.js';

function createTestApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  return app;
}

describe('POST /auth/register', () => {
  beforeEach(async () => {
    process.env.DB_PATH = ':memory:';
    const db = connectDatabase();
    db.prepare('DELETE FROM users').run();

    const passwordHash = await bcrypt.hash('ValidPassword1!', 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)' 
    ).run('existing-user', 'user@example.com', passwordHash, 'Existing User', new Date().toISOString());
  });

  afterEach(() => {
    closeDatabase();
    delete process.env.DB_PATH;
  });

  it('registers a new user and sets the session cookie', async () => {
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
    });
    expect(response.headers['set-cookie']).toBeTruthy();

    const db = connectDatabase();
    const stored = db
      .prepare('SELECT email, name FROM users WHERE email = ?')
      .get('integration@example.com') as { email: string; name: string | null } | undefined;
    expect(stored).toEqual({ email: 'integration@example.com', name: 'Integration Test' });
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
});

