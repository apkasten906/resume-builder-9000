import { describe, it, expect } from 'vitest';
import { requireAuth } from '../../src/middleware/requireAuth';
import { authService } from '../../src/services/authService';

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
