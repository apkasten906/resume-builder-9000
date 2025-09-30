import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../src/services/authService.js';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

// Mock better-sqlite3 and bcryptjs
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn(() => ({
      prepare: vi.fn(() => ({
        get: (email: string) => {
          if (email === 'user@example.com') {
            return { id: 'user-id-1', email, password_hash: 'hashed' };
          }
          return undefined;
        },
      })),
      exec: vi.fn(), // Add missing exec method
      close: vi.fn(),
    })),
  };
});

vi.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: vi.fn((pw, hash) => pw === 'ValidPassword1!' && hash === 'hashed'),
  },
}));

vi.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
    verify: vi.fn((token: string) => {
      if (token === 'valid-token') {
        return { sub: 'user-id-1', email: 'user@example.com' };
      }
      throw new Error('Invalid token');
    }),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns token for valid credentials', async () => {
      // Act
      const res = await authService.login('user@example.com', 'ValidPassword1!');

      // Assert
      expect(res).toBeTruthy();
      expect(res?.token).toBe('mock-jwt-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 'user-id-1', email: 'user@example.com' },
        expect.any(String),
        { expiresIn: '7d' }
      );
    });

    it('returns null for non-existent user', async () => {
      // Act
      const res = await authService.login('nonexistent@example.com', 'ValidPassword1!');

      // Assert
      expect(res).toBeNull();
    });

    it('returns null for invalid password', async () => {
      // Act
      const res = await authService.login('user@example.com', 'WrongPassword!');

      // Assert
      expect(res).toBeNull();
    });
  });

  describe('getUserFromRequest', () => {
    it('extracts user from authorization header', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      } as Request;

      // Act
      const user = await authService.getUserFromRequest(mockRequest);

      // Assert
      expect(user).toEqual({
        id: 'user-id-1',
        email: 'user@example.com',
      });
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    });

    it('extracts user from session cookie', async () => {
      // Arrange
      const mockRequest = {
        cookies: {
          session: 'valid-token',
        },
      } as unknown as Request;

      // Act
      const user = await authService.getUserFromRequest(mockRequest);

      // Assert
      expect(user).toEqual({
        id: 'user-id-1',
        email: 'user@example.com',
      });
    });

    it('returns null when no token is present', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
        cookies: {},
      } as unknown as Request;

      // Act
      const user = await authService.getUserFromRequest(mockRequest);

      // Assert
      expect(user).toBeNull();
    });

    it('returns null when token is invalid', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as Request;

      // Act
      const user = await authService.getUserFromRequest(mockRequest);

      // Assert
      expect(user).toBeNull();
    });
  });
});
