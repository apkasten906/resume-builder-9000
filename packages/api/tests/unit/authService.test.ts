import { describe, it, expect, vi } from 'vitest';
import { authService } from '../../src/services/authService.js';

// Mock better-sqlite3 and bcryptjs
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn(() => ({
      prepare: vi.fn(() => ({
        get: (email: string) => {
          if (email === 'user@example.com') {
            return { id: 1, email, password_hash: 'hashed' };
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

describe('authService', () => {
  it('returns token for valid credentials', async () => {
    const res = await authService.login('user@example.com', 'ValidPassword1!');
    expect(res).toBeTruthy();
    expect(res?.token).toBeTypeOf('string');
  });

  it('returns null for invalid credentials', async () => {
    const res = await authService.login('nope@example.com', 'bad');
    expect(res).toBeNull();
  });
});
