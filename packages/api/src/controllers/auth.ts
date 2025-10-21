import { Request, Response } from 'express';
import { z } from 'zod';
import {
  authService,
  blacklistToken,
  DuplicateEmailError,
  EmailNotConfirmedError,
  ExpiredVerificationTokenError,
  InvalidVerificationTokenError,
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

  try {
    const result = await authService.login(email, password);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });

    setSessionCookie(res, result.token);

    // Only include token in response body for development/testing environments to prevent XSS risks
    const responseData: Record<string, unknown> = { ok: true, user: result.user };
    if (process.env.NODE_ENV !== 'production') {
      responseData.token = result.token;
    }

    return res.json(responseData);
  } catch (error) {
    if (error instanceof EmailNotConfirmedError) {
      return res.status(403).json({
        error: 'Please confirm your email before signing in.',
        field: 'email',
        requiresEmailConfirmation: true,
      });
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login failed:', error);
    }
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
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
    return res.status(201).json({
      ok: true,
      user: registration.user,
      requiresEmailConfirmation: true,
      verification: registration.verification,
    });
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Registration failed:', error);
    }
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<Response> {
  const token =
    (typeof req.query.token === 'string' && req.query.token) ||
    (typeof req.body?.token === 'string' && req.body.token);

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }

  try {
    const result = await authService.verifyEmail(token);

    setSessionCookie(res, result.token);

    const response: Record<string, unknown> = {
      ok: true,
      user: result.user,
    };

    if (process.env.NODE_ENV !== 'production') {
      response.token = result.token;
    }

    return res.json(response);
  } catch (error) {
    if (error instanceof InvalidVerificationTokenError) {
      return res.status(400).json({ error: 'Invalid verification link.' });
    }
    if (error instanceof ExpiredVerificationTokenError) {
      return res.status(410).json({ error: 'Verification link has expired.' });
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('Email verification failed:', error);
    }
    return res.status(500).json({ error: 'Email verification failed. Please try again.' });
  }
}

export async function resendVerification(req: Request, res: Response): Promise<Response> {
  const email = typeof req.body?.email === 'string' ? req.body.email : undefined;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const result = await authService.resendVerification(email);
    return res.json({ ok: true, sentTo: result.sentTo, expiresAt: result.expiresAt });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found.' });
      }
      if (error.message === 'Email already confirmed') {
        return res.status(400).json({ error: 'Email already confirmed.' });
      }
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to resend verification email:', error.message);
      }
    }
    return res.status(500).json({ error: 'Failed to resend verification email.' });
  }
}

/**
 * Get the current verification token for the authenticated user (development only).
 * This endpoint requires authentication and only returns the user's own token.
 * In production, tokens should only be delivered via email for security.
 */
export async function getVerificationToken(req: Request, res: Response): Promise<Response> {
  // Only allow in development/test environments
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const user = await authService.getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tokenData = await authService.getVerificationToken(user.id);
    if (!tokenData) {
      return res.status(404).json({
        error: 'No pending verification token found',
        hint: 'Email may already be verified, or you may need to call /auth/resend-verification first',
      });
    }

    return res.json({
      ok: true,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      verificationUrl: tokenData.verificationUrl,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to retrieve verification token:', error.message);
    }
    return res.status(500).json({ error: 'Failed to retrieve verification token' });
  }
}
