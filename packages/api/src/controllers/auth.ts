import { Request, Response } from 'express';
import { authService, blacklistToken } from '../services/authService.js';

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body || {};
  const result = await authService.login(email, password);
  if (!result) return res.status(401).json({ error: 'Invalid credentials' });
  res.cookie('session', result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
  // Include token in response body for Next.js API route
  return res.json({ ok: true, token: result.token });
}

export async function me(req: Request, res: Response): Promise<Response> {
  const user = await authService.getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user });
}

export async function logout(req: Request, res: Response): Promise<Response> {
  // Invalidate cookie with same options as set
  const token = req.cookies?.session || req.headers.authorization?.split(' ')[1];
  if (token) {
    blacklistToken(token);
  }
  res.clearCookie('session', { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  return res.json({ ok: true });
}
