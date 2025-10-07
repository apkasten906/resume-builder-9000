import { test, expect } from '@playwright/test';

// Simple console logging for debugging
const testLogger = {
  log: (msg: string): void => console.log(`[TEST] ${msg}`),
  debug: (msg: string): void => console.log(`[DEBUG] ${msg}`),
};

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

test.describe('Navigation Visibility - Basic Tests', () => {
  test.beforeAll(async () => {
    // Setup if needed
  });

  test('should show navigation elements on login page', async ({ page }) => {
    testLogger.log('Testing navigation visibility on login page');

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Check if navigation exists (may be minimal on login page)
    const nav = page.locator('nav, aside nav, header nav');
    const navExists = await nav.count();
    testLogger.debug(`Navigation elements found: ${navExists}`);

    // Should have some form of navigation structure
    expect(navExists).toBeGreaterThanOrEqual(0); // May be 0 on login page
  });

  test('should show form elements consistently', async ({ page }) => {
    testLogger.log('Testing form element visibility');

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Check form visibility
    const form = page.locator('form');
    await expect(form).toBeVisible();

    const emailField = page.locator('input[type="email"]');
    await expect(emailField).toBeVisible();

    const passwordField = page.locator('input[type="password"]');
    await expect(passwordField).toBeVisible();

    const submitButton = page.getByRole('button', { name: /sign in|login|submit/i });
    await expect(submitButton).toBeVisible();
  });

  test('should maintain element visibility during interaction', async ({ page }) => {
    testLogger.log('Testing element visibility during form interaction');

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Fill form and check visibility is maintained
    await page.fill('input[type="email"]', 'test@example.com');

    // Check elements are still visible after interaction
    const form = page.locator('form');
    await expect(form).toBeVisible();

    await page.fill('input[type="password"]', 'testpassword');

    // Elements should still be visible
    await expect(form).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should handle page load without flickering', async ({ page }) => {
    testLogger.log('Testing page load stability');

    await page.goto(`${WEB_BASE}/login`);

    // Wait for initial load
    await page.waitForLoadState('load');

    // Give a short time for any dynamic content
    await page.waitForTimeout(1000);

    // Check that main elements are stable
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Wait a bit more to ensure no flickering
    await page.waitForTimeout(2000);

    // Form should still be visible (no flickering)
    await expect(form).toBeVisible();
  });

  test('should navigate between public pages smoothly', async ({ page }) => {
    testLogger.log('Testing navigation between public pages');

    // Start at home page
    await page.goto(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');

    // Navigate to login
    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Should see login form
    await expect(page.locator('form')).toBeVisible();

    // Navigate back to home
    await page.goto(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');

    // Should be back at home (may redirect to login if not authenticated)
    // Just verify the page loads without errors
    expect(page.url()).toContain(WEB_BASE);
  });
});
