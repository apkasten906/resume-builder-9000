import { test, expect } from './test-setup';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

test.describe('Resend verification flow (real email outbox)', () => {
  test.beforeEach(async ({ request }) => {
    // Get test secret for authenticated requests
    const secret = process.env.TEST_ROUTE_SECRET || '';
    let headers: Record<string, string> | undefined;
    if (secret) {
      headers = { 'x-test-secret': secret };
    } else {
      headers = undefined;
    } // Seed an unverified user for testing (idempotent: creates or updates existing user)
    const seedRes = await request.post(`${API_BASE}/__test/seed-unverified-user`, {
      headers,
      data: { email: 'unverified@example.com', password: 'password123' },
    });
    if (!seedRes.ok()) {
      const body = await seedRes.text();
      throw new Error(`Failed to seed unverified test user: ${seedRes.status()} - ${body}`);
    }

    // Clear server-side email outbox before starting
    const clearRes = await request.post(`${API_BASE}/__test/clear-emails`, { headers });
    if (!clearRes.ok()) {
      throw new Error('Failed to clear test email outbox');
    }
  });

  test('shows resend link after 403 and actually records sent email', async ({ page, request }) => {
    // Set route to add test header to login requests
    await page.route('**/api/auth/login', async route => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          'x-test-mode': 'unverified-email',
        },
      });
    });

    await page.goto(`${BASE}/login`);

    await page.fill('input[name="email"]', 'unverified@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Click submit and wait for the UI to show the resend link
    await page.click('button[type="submit"]');

    await page.locator('text=Resend Verification Email').waitFor({ timeout: 10000 });

    // Click resend which will call the real API endpoint on the server
    await page.click('text=Resend Verification Email');

    // Expect success indicator in UI (wait for the success message to appear)
    await expect(page.locator('text=Verification email resent successfully')).toBeVisible({
      timeout: 10000,
    });

    // Poll the test outbox endpoint to find the sent email
    const secret = process.env.TEST_ROUTE_SECRET || '';
    let headers: Record<string, string> | undefined;
    if (secret) {
      headers = { 'x-test-secret': secret };
    } else {
      headers = undefined;
    }
    const res = await request.get(`${API_BASE}/__test/emails`, { headers });
    if (!res.ok()) {
      throw new Error('Failed to fetch test email outbox');
    }
    const outbox = (await res.json()) as Array<{ to: string; subject: string; text: string }>;

    expect(Array.isArray(outbox)).toBeTruthy();
    const found = outbox.find(
      e =>
        e.to === 'unverified@example.com' &&
        /Confirm your Resume Builder 9000 account/.test(e.subject)
    );
    expect(found).toBeTruthy();
  });
});
