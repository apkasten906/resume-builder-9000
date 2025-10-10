import { Request, Response } from 'express';
import { z } from 'zod';
import {
  authService,
  blacklistToken,
  DuplicateEmailError,
  PasswordPolicyError,
} from '../services/authService.js';
import { evaluatePassword } from '@rb9k/core';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be 120 characters or fewer')
    .optional(),
});

function setSessionCookie(res: Response, token: string): void {
  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body || {};
  const result = await authService.login(email, password);
  if (!result) return res.status(401).json({ error: 'Invalid credentials' });

  setSessionCookie(res, result.token);

  // Only include token in response body for development/testing environments to prevent XSS risks
  const responseData: Record<string, unknown> = { ok: true, user: result.user };
  if (process.env.NODE_ENV !== 'production') {
    responseData.token = result.token;
  }

  return res.json(responseData);
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
  res.clearCookie('session', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return res.json({ ok: true });
}

export async function register(req: Request, res: Response): Promise<Response> {
  const parseResult = registerSchema.safeParse(req.body ?? {});

  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstField = (Object.keys(fieldErrors)[0] ?? 'email') as keyof typeof fieldErrors;
    const message = fieldErrors[firstField]?.[0] ?? 'Invalid registration details';
    return res.status(400).json({
      error: message,
      field: String(firstField),
    });
  }

  const { email, password, confirmPassword, fullName } = parseResult.data;

  if (password !== confirmPassword) {
    return res.status(400).json({
      error: 'Passwords do not match',
      field: 'confirmPassword',
    });
  }

  const evaluation = evaluatePassword(password);
  if (!evaluation.valid) {
    const unmet = evaluation.requirements.filter(req => !req.met).map(req => req.id);
    return res.status(400).json({
      error: 'Password does not meet security requirements',
      field: 'password',
      unmet,
    });
  }

  try {
    const registration = await authService.register({
      email,
      password,
      name: fullName,
    });

    setSessionCookie(res, registration.token);

    const response: Record<string, unknown> = {
      ok: true,
      user: registration.user,
    };

    if (process.env.NODE_ENV !== 'production') {
      response.token = registration.token;
    }

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return res.status(409).json({ error: 'Email already registered', field: 'email' });
    }
    if (error instanceof PasswordPolicyError) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        field: 'password',
        unmet: error.unmetRequirements,
      });
    }
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}
