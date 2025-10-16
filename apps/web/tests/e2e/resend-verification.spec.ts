import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Resend verification flow', () => {
  test('shows resend link after 403 and resends email', async ({ page }) => {
    // Log network requests/responses and runtime errors for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));
    page.on('request', req => console.log('PAGE REQ:', req.method(), req.url()));
    page.on('response', res => console.log('PAGE RES:', res.status(), res.url()));

    // Intercept login to respond with 403 and requiresEmailConfirmation
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email not verified', requiresEmailConfirmation: true }),
      });
    });

    // Intercept verify-email to simulate success
    await page.route('**/api/auth/verify-email', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Verification email resent' }),
      });
    });

    await page.goto(`${BASE}/login`);

    await page.fill('input[name="email"]', 'unverified@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Click submit and wait for the mocked login flow to update the UI
    await page.click('button[type="submit"]');

    // Expect resend link to appear (backend provides an error message; exact text may vary)
    try {
      await page.locator('text=Resend Verification Email').waitFor({ timeout: 30000 });
    } catch (err) {
      // Dump page content for debugging
      // eslint-disable-next-line no-console
      console.log('PAGE CONTENT AFTER CLICK:\n', await page.content());
      throw err;
    }

    // Click resend and expect success message
    await page.click('text=Resend Verification Email');
    await expect(page.locator('text=Verification email')).toBeVisible();
  });
});
