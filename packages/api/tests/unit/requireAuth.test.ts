import { describe, it, expect, vi } from 'vitest';
// Mock better-sqlite3 and bcryptjs to match authService.test.ts
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
import { requireAuth } from '../../src/middleware/requireAuth.js';
import { authService } from '../../src/services/authService.js';

function mockReq(token?: string) {
  return { cookies: token ? { session: token } : {}, headers: {} } as any;
}
function mockRes() {
  const res: any = {};
  res.statusCode = 200;
  res.status = (c: number) => {
    res.statusCode = c;
    return res;
  };
  res.json = (b: any) => {
    res.body = b;
    return res;
  };
  return res;
}

describe('requireAuth', () => {
  it('rejects when not authenticated', async () => {
    const req = mockReq();
    const res = mockRes();
    let nextCalled = false;
    await requireAuth(req, res, () => {
      nextCalled = true;
    });
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });

  it('passes when valid token is present', async () => {
    const login = await authService.login('user@example.com', 'ValidPassword1!');
    const req = mockReq(login!.token);
    const res = mockRes();
    let nextCalled = false;
    await requireAuth(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
