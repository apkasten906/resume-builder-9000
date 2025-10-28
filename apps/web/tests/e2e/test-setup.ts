import { test as base, expect, Page } from '@playwright/test';
import { testLogger } from './utils/test-logger';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load repo root .env so TEST_ROUTE_SECRET and other vars are available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });

export const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
export const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const COOKIE_NAME = process.env.AUTH_SESSION_COOKIE_NAME || 'session'; // ← match your app

async function getBearerToken(): Promise<string> {
  try {
    // Allow overriding the seeded login credentials via env vars when running tests
    const seedEmail = process.env.TEST_SEED_EMAIL || 'user@example.com';
    const seedPassword = process.env.TEST_SEED_PASSWORD || 'ValidPassword1!';
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: seedEmail, password: seedPassword }),
    });
    // Read the response body once, parse JSON if possible, and log/handle errors.
    const raw = await r.text();
    let data: { token?: string } | null = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // Not JSON — keep raw for logging
      data = null;
    }

    if (!r.ok) {
      console.error('PLAYWRIGHT-DEBUG: /auth/login failed', { status: r.status, body: raw });
      throw new Error(`login failed: ${r.status} ${raw}`);
    }

    if (!data?.token) {
      throw new Error('Token not available in response: ' + raw);
    }

    return data.token as string;
  } catch (err) {
    testLogger.error('API login failed:', err instanceof Error ? err.message : String(err));
    throw err;
  }
}

/** Seed the auth cookie so /api/auth/me sees it on first render */
async function seedAuthCookie(page: Page): Promise<string> {
  const token = await getBearerToken();

  // Use ONLY `url` so Playwright infers domain + path for us.
  await page.context().addCookies([
    {
      name: COOKIE_NAME,
      value: token,
      url: new URL('/', WEB_BASE).toString(), // e.g. "http://localhost:3000/"
      httpOnly: true, // mirror real session cookies
      sameSite: 'Lax',
      secure: new URL(WEB_BASE).protocol === 'https:',
    },
  ]);

  // Optional warmup: hit the site so the cookie is attached to requests.
  await page.goto(WEB_BASE, { waitUntil: 'domcontentloaded' });

  return token;
}

export type AuthFixtures = { authToken: string };

export const testWithAuth = base.extend<AuthFixtures>({
  authToken: async ({ page }, run) => {
    const token = await seedAuthCookie(page);
    await run(token);
  },
});

// Global beforeEach: logged-in by default. If some specs need anonymous, they can clear cookie.
base.beforeEach(async ({ page }) => {
  try {
    await seedAuthCookie(page);
    testLogger.log('Auth cookie seeded; navigating to /applications');
    await page.goto(`${WEB_BASE}/applications`, { waitUntil: 'domcontentloaded' });
  } catch (e) {
    testLogger.error('Auth setup failed:', e instanceof Error ? e.message : String(e));
    testLogger.warn('Continuing test without auth…');
  }
});

export const test = base;
export { expect };

/**
 * Optional helpers for specs that want to flip states programmatically
 */
export async function logoutViaRoute(page: Page): Promise<void> {
  const resp = await page.request.post(`${WEB_BASE}/api/auth/logout`);
  testLogger.log(`/api/auth/logout -> ${resp.status()}`);
  // Clear cookie on the browser context as well (belt & suspenders)
  await page.context().clearCookies();
}
