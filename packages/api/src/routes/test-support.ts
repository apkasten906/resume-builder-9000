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

// Debug: indicate the module has been loaded and whether test routes are enabled (dev/test only)
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line no-console -- debug visibility for local dev
    console.info(
      '[test-support] module loaded. ENABLE_TEST_ROUTES=',
      process.env.ENABLE_TEST_ROUTES,
      'NODE_ENV=',
      process.env.NODE_ENV
    );
  } catch {
    // ignore
  }
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
    return res.status(200).json({
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

  // Extract client IP, considering proxy headers and socket remote address
  let ip =
    req.headers['x-forwarded-for']
      ?.toString()
      .split(',')
      .map(s => s.trim())[0] ||
    req.headers['x-real-ip']?.toString() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '';
  ip = ip.toString();
  // Consider localhost addresses and Docker gateway addresses when running Playwright
  // against containers. To avoid being overly permissive, allow Docker gateway addresses
  // only for a configurable trusted subnet (defaults to 172.20.). This reduces the risk
  // of accidentally trusting unrelated 172.* IPs.
  const trustedSubnetPrefix = process.env.TEST_TRUSTED_SUBNET || '172.20.';
  const isLocal =
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('::ffff:127.') ||
    ip.startsWith('127.') ||
    // If DOCKER_TESTING is enabled, treat Docker bridge gateway IPs from the trusted
    // subnet as local so test-support endpoints can be called from the host when
    // containers are used for E2E runs.
    (process.env.DOCKER_TESTING === 'true' &&
      (ip.startsWith(`::ffff:${trustedSubnetPrefix}`) || ip.startsWith(trustedSubnetPrefix)));

  // First, require that a secret is configured and that the caller provided the correct one.
  if (!secret || provided !== secret) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console -- log suspicious access attempts for local debugging
      console.warn('[test-support] Blocked test-support access - missing or mismatched secret', {
        ip,
        hasSecret: Boolean(secret),
        provided: provided ? 'yes' : 'no',
      });
    }
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  // If the secret matches we may allow non-local access, but only when explicitly
  // running in DOCKER_TESTING mode. This limits exposure: even with a leak of the
  // TEST_ROUTE_SECRET, non-local access won't be permitted unless DOCKER_TESTING=true
  // is set. When not allowed, return 403 to be conservative.
  if (!isLocal) {
    if (process.env.DOCKER_TESTING === 'true') {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console -- debug visibility for non-local but authorized calls
        console.info(
          '[test-support] Non-local request with valid secret and DOCKER_TESTING=true - allowing access',
          { ip }
        );
      }
      return next();
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console -- suspicious access attempts
      console.warn(
        '[test-support] Blocked non-local test-support access even though secret matched because DOCKER_TESTING!=true',
        { ip }
      );
    }
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  // Debug logging only in dev/test
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console -- debug visibility
    console.info('[test-support] ensureTestAccess passed for ip=', ip);
  }
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

  // Test-only endpoint to check if a specific user exists by email
  router.get('/__test/user-exists', async (req, res) => {
    try {
      const email = (req.query.email as string) || '';
      if (!email) return res.status(400).json({ error: 'email is required' });
      const db = connectDatabase();
      const row = db.prepare('SELECT 1 as exists FROM users WHERE email = ?').get(email) as
        | { exists: number }
        | undefined;
      return res.status(200).json({ exists: Boolean(row?.exists) });
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to check user existence', err);
      return res.status(500).json({ error: 'Failed to check user existence' });
    }
  });

  // Test-only endpoint to count users whose emails start with a given prefix
  router.get('/__test/count-users', async (req, res) => {
    try {
      const prefix = (req.query.prefix as string) || '';
      if (!prefix) return res.status(400).json({ error: 'prefix is required' });
      const db = connectDatabase();
      const row = db
        .prepare('SELECT COUNT(*) as count FROM users WHERE email LIKE ?')
        .get(`${prefix}%`) as { count: number } | undefined;
      return res.status(200).json({ count: row?.count ?? 0 });
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to count users', err);
      return res.status(500).json({ error: 'Failed to count users' });
    }
  });

  // Test-only endpoint to seed a verified user
  router.post('/__test/seed-verified-user', async (req, res) => {
    try {
      // eslint-disable-next-line no-console -- debug visibility
      console.info('[test-support] POST /__test/seed-verified-user called');

      const { email, password, name } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
      }

      const db = connectDatabase();
      const bcrypt = await import('bcryptjs');
      const { randomUUID } = await import('crypto');

      // Upsert behaviour: delete any existing test user with the same email, then insert a fresh
      // verified user record. This guarantees idempotent test state and resets password.
      try {
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
          | { id: string }
          | undefined;

        if (existing) {
          // Remove existing record completely to avoid accumulating Playwright test users
          db.prepare('DELETE FROM users WHERE id = ?').run(existing.id);
        }

        const userId = randomUUID();
        const passwordHash = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();

        db.prepare(
          'INSERT INTO users (id, email, password_hash, name, email_confirmed, email_confirmed_at, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)'
        ).run(userId, email, passwordHash, name || null, createdAt, createdAt);

        return res.status(201).json({ ok: true, userId, existed: Boolean(existing) });
      } catch (e) {
        // eslint-disable-next-line no-console -- test route error visibility
        console.warn('[test-support] Upsert failed in seed-verified-user', e);
        return res.status(500).json({ error: 'Failed to seed verified user' });
      }
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to seed verified user', err);
      return res.status(500).json({ error: 'Failed to seed verified user' });
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

      // Upsert behaviour: delete any existing test user with the same email, then insert a fresh
      // unverified user record. This guarantees idempotent test state and resets password.
      try {
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
          | { id: string }
          | undefined;

        if (existing) {
          // Remove existing record completely to avoid accumulating Playwright test users
          db.prepare('DELETE FROM users WHERE id = ?').run(existing.id);
        }

        const userId = randomUUID();
        const passwordHash = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();

        db.prepare(
          'INSERT INTO users (id, email, password_hash, email_confirmed, created_at) VALUES (?, ?, ?, 0, ?)'
        ).run(userId, email, passwordHash, createdAt);

        return res.status(201).json({ ok: true, userId, existed: Boolean(existing) });
      } catch (e) {
        // eslint-disable-next-line no-console -- test route error visibility
        console.warn('[test-support] Upsert failed in seed-unverified-user', e);
        return res.status(500).json({ error: 'Failed to seed unverified user' });
      }
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to seed unverified user', err);
      return res.status(500).json({ error: 'Failed to seed unverified user' });
    }
  });

  // Test-only endpoint to delete a user by email (secure: respects ensureTestAccess)
  router.post('/__test/delete-user', async (req, res) => {
    try {
      // eslint-disable-next-line no-console -- debug visibility
      console.info('[test-support] POST /__test/delete-user called');
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: 'email is required' });

      const db = connectDatabase();
      const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
        | { id: string }
        | undefined;
      if (!row) return res.status(404).json({ error: 'User not found' });

      db.prepare('DELETE FROM users WHERE id = ?').run(row.id);
      return res.status(200).json({ ok: true, deletedId: row.id });
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to delete user', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Test-only endpoint to cleanup Playwright/test users by email prefix (e.g. 'pw-' or 'playwright-')
  router.post('/__test/cleanup-playwright-users', async (_req, res) => {
    try {
      // eslint-disable-next-line no-console -- debug visibility
      console.info('[test-support] POST /__test/cleanup-playwright-users called');
      const db = connectDatabase();
      // Delete accounts where email starts with typical test prefixes
      const prefixes = ['pw-', 'playwright-', 'test-'];
      const likeClauses = prefixes.map(() => 'email LIKE ?').join(' OR ');
      const params = prefixes.map(p => `${p}%`);
      const stmt = db.prepare(`DELETE FROM users WHERE ${likeClauses}`);
      const info = stmt.run(...params);
      return res.status(200).json({ ok: true, changes: info.changes });
    } catch (err) {
      // eslint-disable-next-line no-console -- test route error visibility
      console.warn('[test-support] Failed to cleanup playwright users', err);
      return res.status(500).json({ error: 'Failed to cleanup playwright users' });
    }
  });
}

export default router;
