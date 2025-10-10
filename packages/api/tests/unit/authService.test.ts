import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Request } from 'express';
import bcrypt from 'bcryptjs';
import {
  authService,
  DuplicateEmailError,
  PasswordPolicyError,
} from '../../src/services/authService.js';
import { connectDatabase, closeDatabase } from '../../src/db.js';

const BASE_USER = {
  id: 'user-id-1',
  email: 'user@example.com',
  password: 'ValidPassword1!',
  name: 'Test User',
};

describe('authService', () => {
  beforeEach(async () => {
    process.env.DB_PATH = ':memory:';
    const db = connectDatabase();
    db.prepare('DELETE FROM users').run();

    const passwordHash = await bcrypt.hash(BASE_USER.password, 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)' 
    ).run(BASE_USER.id, BASE_USER.email, passwordHash, BASE_USER.name, new Date().toISOString());
  });

  afterEach(() => {
    closeDatabase();
    delete process.env.DB_PATH;
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
  });

  describe('register', () => {
    it('creates a new user, hashes the password, and issues a session token', async () => {
      const email = 'new.user@example.com';
      const password = 'AnotherValid1!';
      const name = 'New User';

      const result = await authService.register({ email, password, name });

      expect(result.token).toBeTypeOf('string');
      expect(result.user.email).toBe(email);
      expect(result.user.name).toBe(name);

      const db = connectDatabase();
      const stored = db
        .prepare('SELECT email, password_hash, name FROM users WHERE email = ?')
        .get(email) as { email: string; password_hash: string; name: string | null } | undefined;

      expect(stored).toBeTruthy();
      expect(stored?.name).toBe(name);
      expect(await bcrypt.compare(password, stored?.password_hash ?? '')).toBe(true);
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
});

