// Removed unused import
import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';

// Define the base URLs
const WEB_BASE = 'http://localhost:3000';

// Test credentials
const TEST_USER = {
  email: 'user@example.com',
  password: 'ValidPassword1!',
};

test('UI-based login test', async ({ page }) => {
  testLogger.log('Starting UI-based login test...');

  try {
    // 1. Go to the login page
    testLogger.log('Navigating to login page...');
    await page.goto(`${WEB_BASE}/login`, { waitUntil: 'domcontentloaded' });

    // Take screenshot for debugging
    await page.screenshot({ path: './test-results/login-page.png', fullPage: true });

    // 2. Fill out the login form
    testLogger.log('Filling login form...');

    // Debug the page HTML
    const content = await page.content();
    testLogger.log('Page HTML excerpt:', content.substring(0, 500) + '...');

    // Wait for any sign of a form
    await page
      .waitForSelector('form, input, button', { timeout: 10000 })
      .catch(() => testLogger.error('Could not find any form elements on the page'));

    // Get all inputs on the page for debugging
    const inputCount = await page.locator('input').count();
    testLogger.log(`Found ${inputCount} input fields on the page`);

    for (let i = 0; i < inputCount; i++) {
      const input = page.locator('input').nth(i);
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      testLogger.log(`Input ${i}: type=${type}, name=${name}`);
    }

    // Use more reliable selectors with lower timeout to avoid hanging
    try {
      const emailInput = page
        .locator('input[name="email"], input[type="email"], input[placeholder*="email" i]')
        .first();
      await emailInput.waitFor({ timeout: 5000 });
      await emailInput.fill(TEST_USER.email);
    } catch (e) {
      testLogger.error('Failed to fill email field:', e);
    }

    try {
      const passwordInput = page
        .locator('input[name="password"], input[type="password"], input[placeholder*="password" i]')
        .first();
      await passwordInput.waitFor({ timeout: 5000 });
      await passwordInput.fill(TEST_USER.password);
    } catch (e) {
      testLogger.error('Failed to fill password field:', e);
    }

    // 3. Submit the form
    testLogger.log('Submitting login form...');
    try {
      const submitButton = page
        .locator(
          'button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Login")'
        )
        .first();
      await submitButton.waitFor({ timeout: 5000 });
      await submitButton.click();
    } catch (e) {
      testLogger.error('Failed to click submit button:', e);
      // Try using Enter key on the password field as a fallback
      try {
        await page.locator('input[type="password"]').press('Enter');
      } catch (e2) {
        testLogger.error('Failed to press Enter on password field:', e2);
      }
    }

    // Wait for navigation to complete
    await page.waitForTimeout(2000);

    // 4. Check if we're logged in (redirected to applications page)
    const currentUrl = page.url();
    testLogger.log('After login URL:', currentUrl);

    // 5. Take a screenshot of where we ended up
    await page.screenshot({ path: './test-results/after-login.png', fullPage: true });

    // 6. Check for session cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session');
    testLogger.log('Session cookie:', sessionCookie ? 'Found' : 'Not found');

    // 7. Run assertions
    expect(sessionCookie).toBeDefined();

    // Either we should be on applications page or dashboard
    expect(currentUrl).not.toContain('/login');

    // 8. If we're on applications page, verify some content
    if (currentUrl.includes('/applications')) {
      await expect(page.getByRole('heading', { name: /applications/i })).toBeVisible();
    }
  } catch (error: unknown) {
    const err = error as Error;
    testLogger.error('Test error:', err.message);
    await page.screenshot({ path: './test-results/login-error.png', fullPage: true });
    throw error;
  }
});
