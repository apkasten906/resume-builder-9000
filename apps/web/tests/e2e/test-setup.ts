import { test as base, expect, Page } from '@playwright/test';
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const COOKIE_NAME = process.env.AUTH_SESSION_COOKIE_NAME || 'session'; // ← match your app

async function getBearerToken(): Promise<string> {
  try {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'ValidPassword1!' }),
    });
    if (!r.ok) throw new Error(`login failed: ${r.status}`);
    const data = (await r.json()) as { token: string };
    return data.token;
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
