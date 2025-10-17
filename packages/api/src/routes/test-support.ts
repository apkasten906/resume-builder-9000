// packages/api/src/routes/test-support.ts
import { Router, Request, Response, NextFunction } from 'express';
import { applicationsRepo } from '../repositories/applicationsRepo.js';
import { connectDatabase } from '../db.js';
import { getEmailOutbox, clearEmailOutbox } from '../services/emailService.js';

/**
 * This route is ONLY for testing purposes
 * It should never be enabled in production environments
 */
const router = Router();

// Debug: indicate the module has been loaded and whether test routes are enabled
try {
  // eslint-disable-next-line no-console -- debug visibility for local dev
  console.info(
    '[test-support] module loaded. ENABLE_TEST_ROUTES=',
    process.env.ENABLE_TEST_ROUTES,
    'NODE_ENV=',
    process.env.NODE_ENV
  );
} catch (e) {
  // ignore
}

// Opt-in, unprotected debug endpoint (ONLY when explicitly enabled via DEBUG_TEST_ROUTES=true)
// This is intentionally unprotected so a developer can assert the module is present without needing the
// TEST_ROUTE_SECRET. DO NOT enable this in CI/prod. It's off by default.
if (process.env.DEBUG_TEST_ROUTES === 'true') {
  // eslint-disable-next-line no-console
  console.info(
    '[test-support] DEBUG_TEST_ROUTES enabled: mounting unprotected /__test/debug/status'
  );
  router.get('/__test/debug/status', (_req, res) => {
    return res
      .status(200)
      .json({
        ok: true,
        enabled: process.env.ENABLE_TEST_ROUTES === 'true',
        nodeEnv: process.env.NODE_ENV,
      });
  });
}

// Enable this route in explicit test environment or when ENABLE_TEST_ROUTES=true
// This ensures the endpoints are not exposed in production by accident.
const isTestEnvironment =
  process.env.NODE_ENV === 'test' || process.env.ENABLE_TEST_ROUTES === 'true';

// When test routes are enabled outside of the test environment (e.g. development),
// enforce additional checks: only allow requests from localhost and require a
// matching secret header to avoid accidental exposure.
function ensureTestAccess(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'test') return next();

  const secret = process.env.TEST_ROUTE_SECRET || '';
  const provided = req.get('x-test-secret') || '';

  const ip = (req.ip || req.connection?.remoteAddress || '').toString();
  const isLocal =
    ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:127.') || ip.startsWith('127.');

  if (!isLocal || !secret || provided !== secret) {
    // eslint-disable-next-line no-console -- log suspicious access attempts for local debugging
    console.warn('[test-support] Blocked test-support access', {
      ip,
      hasSecret: Boolean(secret),
      provided: provided ? 'yes' : 'no',
    });
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  // eslint-disable-next-line no-console -- debug visibility
  console.info('[test-support] ensureTestAccess passed for ip=', ip);
  return next();
}

if (isTestEnvironment) {
  if (process.env.NODE_ENV !== 'test') {
    router.use(ensureTestAccess);
  }
  // Test-only endpoint to create an application without authentication
  router.post('/applications', async (req, res) => {
    const { company, role, location } = req.body || {};
    if (!company || !role) {
      return res.status(400).json({ error: 'company and role are required' });
    }
    const created = applicationsRepo.create({ company, role, location });
    return res.status(201).json(created);
  });

  // Test-only endpoint to clear all applications
  router.post('/clear-applications', async (_req, res) => {
    // Get direct DB connection instead of using the repository
    const db = connectDatabase();
    db.prepare('DELETE FROM applications').run();
    return res.status(200).json({ message: 'All applications cleared' });
  });

  // Test-only endpoint to read the in-memory email outbox
  router.get('/__test/emails', async (_req, res) => {
    try {
      // eslint-disable-next-line no-console -- debug visibility
      console.info('[test-support] GET /__test/emails called');
      const outbox = getEmailOutbox();
      return res.status(200).json(outbox);
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to read email outbox', err);
      return res.status(500).json({ error: 'Failed to read email outbox' });
    }
  });

  // Test-only endpoint to clear the in-memory email outbox
  router.post('/__test/clear-emails', async (_req, res) => {
    try {
      // eslint-disable-next-line no-console -- debug visibility
      console.info('[test-support] POST /__test/clear-emails called');
      clearEmailOutbox();
      return res.status(200).json({ ok: true });
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to clear email outbox', err);
      return res.status(500).json({ error: 'Failed to clear email outbox' });
    }
  });

  // Test-only endpoint to seed an unverified user
  router.post('/__test/seed-unverified-user', async (req, res) => {
    try {
      // eslint-disable-next-line no-console -- debug visibility
      console.info('[test-support] POST /__test/seed-unverified-user called');

      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
      }

      const db = connectDatabase();
      const bcrypt = await import('bcryptjs');
      const { randomUUID } = await import('crypto');

      // Check if user already exists
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
        | { id: string }
        | undefined;
      if (existing) {
        // Update existing user to be unverified
        db.prepare('UPDATE users SET email_confirmed = 0 WHERE email = ?').run(email);
        return res.status(200).json({ ok: true, userId: existing.id, existed: true });
      }

      // Create new unverified user
      const userId = randomUUID();
      const passwordHash = await bcrypt.hash(password, 10);
      const createdAt = new Date().toISOString();

      db.prepare(
        'INSERT INTO users (id, email, password_hash, email_confirmed, created_at) VALUES (?, ?, ?, 0, ?)'
      ).run(userId, email, passwordHash, createdAt);

      return res.status(201).json({ ok: true, userId, existed: false });
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to seed unverified user', err);
      return res.status(500).json({ error: 'Failed to seed unverified user' });
    }
  });
}

export default router;
