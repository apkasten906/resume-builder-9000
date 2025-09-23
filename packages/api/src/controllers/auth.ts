import { Request, Response } from 'express';
import { authService } from '../services/authService.js';

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body || {};
  const result = await authService.login(email, password);
  if (!result) return res.status(401).json({ error: 'Invalid credentials' });
  res.cookie('session', result.token, { httpOnly: true, sameSite: 'lax', secure: false });
  return res.json({ ok: true });
}

export async function me(req: Request, res: Response): Promise<Response> {
  const user = await authService.getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({ user });
}

export async function logout(_req: Request, res: Response): Promise<Response> {
  // Invalidate cookie client-side; server-side blacklist optional
  res.clearCookie('session');
  return res.json({ ok: true });
}
