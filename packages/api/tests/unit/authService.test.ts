import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Request } from 'express';
import bcrypt from 'bcryptjs';
import {
  authService,
  DuplicateEmailError,
  PasswordPolicyError,
  EmailNotConfirmedError,
  ExpiredVerificationTokenError,
  InvalidVerificationTokenError,
} from '../../src/services/authService.js';
import { connectDatabase, closeDatabase } from '../../src/db.js';
import { clearEmailOutbox, getEmailOutbox } from '../../src/services/emailService.js';

const BASE_USER = {
  id: 'user-id-1',
  email: 'user@example.com',
  password: 'ValidPassword1!',
  name: 'Test User',
};

describe('authService', () => {
  beforeEach(async () => {
    process.env.DB_PATH = ':memory:';
    process.env.APP_BASE_URL = 'http://localhost:3000';
    const db = connectDatabase();
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM email_verification_tokens').run();
    clearEmailOutbox();

    const passwordHash = await bcrypt.hash(BASE_USER.password, 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, created_at, email_confirmed, email_confirmed_at) VALUES (?, ?, ?, ?, ?, 1, ?)' 
    ).run(
      BASE_USER.id,
      BASE_USER.email,
      passwordHash,
      BASE_USER.name,
      new Date().toISOString(),
      new Date().toISOString()
    );
  });

  afterEach(() => {
    closeDatabase();
    delete process.env.DB_PATH;
    delete process.env.APP_BASE_URL;
    clearEmailOutbox();
  });

  describe('login', () => {
    it('returns a token and user profile for valid credentials', async () => {
      const result = await authService.login(BASE_USER.email, BASE_USER.password);

      expect(result).toBeTruthy();
      expect(result?.token).toBeTypeOf('string');
      expect(result?.user).toEqual({ id: BASE_USER.id, email: BASE_USER.email, name: BASE_USER.name });
    });

    it('returns null for an unknown email', async () => {
      const result = await authService.login('missing@example.com', BASE_USER.password);
      expect(result).toBeNull();
    });

    it('returns null for an incorrect password', async () => {
      const result = await authService.login(BASE_USER.email, 'WrongPassword!1');
      expect(result).toBeNull();
    });

    it('throws EmailNotConfirmedError when the account is not verified', async () => {
      const db = connectDatabase();
      const passwordHash = await bcrypt.hash('ValidPassword1!', 10);
      db.prepare(
        'INSERT INTO users (id, email, password_hash, name, created_at, email_confirmed, email_confirmed_at) VALUES (?, ?, ?, ?, ?, 0, NULL)'
      ).run('pending-user', 'pending@example.com', passwordHash, 'Pending User', new Date().toISOString());

      await expect(authService.login('pending@example.com', 'ValidPassword1!')).rejects.toBeInstanceOf(
        EmailNotConfirmedError
      );
    });
  });

  describe('register', () => {
    it('creates a new user, hashes the password, and sends verification details', async () => {
      const email = 'new.user@example.com';
      const password = 'AnotherValid1!';
      const name = 'New User';

      const result = await authService.register({ email, password, name });

      expect(result.user.email).toBe(email);
      expect(result.user.name).toBe(name);
      expect(result.verification.sentTo).toBe(email);
      expect(new Date(result.verification.expiresAt).getTime()).toBeGreaterThan(Date.now());

      const db = connectDatabase();
      const stored = db
        .prepare('SELECT email, password_hash, name, email_confirmed FROM users WHERE email = ?')
        .get(email) as
        | { email: string; password_hash: string; name: string | null; email_confirmed: number }
        | undefined;

      expect(stored).toBeTruthy();
      expect(stored?.name).toBe(name);
      expect(await bcrypt.compare(password, stored?.password_hash ?? '')).toBe(true);
      expect(stored?.email_confirmed).toBe(0);

      const outbox = getEmailOutbox();
      expect(outbox.length).toBeGreaterThan(0);
      const latest = outbox[outbox.length - 1];
      expect(latest.to).toBe(email);
      expect(latest.metadata?.token).toBeTypeOf('string');
    });

    it('throws DuplicateEmailError when the email is already registered', async () => {
      await expect(authService.register({ email: BASE_USER.email, password: 'ValidPassword1!', name: 'Copy Cat' })).rejects.toBeInstanceOf(
        DuplicateEmailError
      );
    });

    it('throws PasswordPolicyError when the password is too weak', async () => {
      await expect(
        authService.register({ email: 'weak@example.com', password: 'password', name: 'Weak' })
      ).rejects.toBeInstanceOf(PasswordPolicyError);
    });
  });

  describe('getUserFromRequest', () => {
    it('returns the user when a valid bearer token is provided', async () => {
      const login = await authService.login(BASE_USER.email, BASE_USER.password);
      expect(login).toBeTruthy();

      const request = { headers: { authorization: `Bearer ${login?.token}` } } as Request;
      const user = await authService.getUserFromRequest(request);

      expect(user).toEqual({ id: BASE_USER.id, email: BASE_USER.email, name: BASE_USER.name });
    });

    it('returns null when the token is missing', async () => {
      const request = { headers: {}, cookies: {} } as unknown as Request;
      const user = await authService.getUserFromRequest(request);
      expect(user).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('confirms the user and returns a session token', async () => {
      await authService.register({
        email: 'verify@example.com',
        password: 'ValidPassword1!',
        name: 'Verify Me',
      });

      const outbox = getEmailOutbox();
      const latest = outbox[outbox.length - 1];
      const token = String(latest.metadata?.token ?? '');

      const result = await authService.verifyEmail(token);

      expect(result.token).toBeTypeOf('string');
      expect(result.user.email).toBe('verify@example.com');

      const db = connectDatabase();
      const stored = db
        .prepare('SELECT email_confirmed, email_confirmed_at FROM users WHERE email = ?')
        .get('verify@example.com') as { email_confirmed: number; email_confirmed_at: string | null };
      expect(stored.email_confirmed).toBe(1);
      expect(stored.email_confirmed_at).not.toBeNull();

      const tokens = db
        .prepare('SELECT COUNT(1) as count FROM email_verification_tokens WHERE user_id = ?')
        .get(result.user.id) as { count: number };
      expect(tokens.count).toBe(0);
    });

    it('throws InvalidVerificationTokenError when token is unknown', async () => {
      await expect(authService.verifyEmail('unknown-token')).rejects.toBeInstanceOf(
        InvalidVerificationTokenError
      );
    });

    it('throws ExpiredVerificationTokenError when the token is expired', async () => {
      await authService.register({
        email: 'expire@example.com',
        password: 'ValidPassword1!',
        name: 'Expired Token',
      });

      const db = connectDatabase();
      const tokenRecord = db
        .prepare(
          'SELECT user_id FROM email_verification_tokens WHERE user_id = (SELECT id FROM users WHERE email = ?)' 
        )
        .get('expire@example.com') as { user_id: string };

      db.prepare('UPDATE email_verification_tokens SET expires_at = ? WHERE user_id = ?').run(
        new Date(Date.now() - 60_000).toISOString(),
        tokenRecord.user_id
      );

      const outbox = getEmailOutbox();
      const latest = outbox[outbox.length - 1];
      const token = String(latest.metadata?.token ?? '');

      await expect(authService.verifyEmail(token)).rejects.toBeInstanceOf(
        ExpiredVerificationTokenError
      );
    });
  });
});

