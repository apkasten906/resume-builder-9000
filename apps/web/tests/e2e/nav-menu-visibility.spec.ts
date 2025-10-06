import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Test to verify navigation menu is hidden for non-authenticated users
 */
test.describe('Navigation Menu Visibility', () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies to ensure we start with a clean slate (no session)
    await context.clearCookies();
    testLogger.log('Cleared all cookies to start with non-authenticated state');
  });

  test('Navigation menu should be hidden when user is not authenticated', async ({ page }) => {
    testLogger.log('Testing navigation menu visibility for non-authenticated user');

    // 1. Visit the root page without any authentication
    await page.goto(WEB_BASE);
    testLogger.log('Navigated to root page');

    // 2. Wait for the page to load and authentication check to complete
    await page.waitForTimeout(2000);
    testLogger.log('Waited for authentication check to complete');

    // 3. Check that navigation sidebar is not visible
    const sidebar = page.locator('aside nav');
    const sidebarExists = await sidebar.count();
    testLogger.log(`Sidebar navigation elements found: ${sidebarExists}`);

    expect(sidebarExists).toBe(0);
    testLogger.log('✅ Verified: Navigation sidebar is hidden for non-authenticated users');

    // 4. Verify that the "Get Started" button is visible instead
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('✅ Verified: Get Started button is visible for non-authenticated users');

    // 5. Verify specific navigation items are NOT present
    const navigationItems = [
      'Resume Upload',
      'Job Intake',
      'Tailor',
      'Preview & Download',
      'Applications',
      'Settings',
    ];

    for (const item of navigationItems) {
      const navItem = page.locator(`nav a:has-text("${item}")`);
      const itemCount = await navItem.count();
      expect(itemCount).toBe(0);
      testLogger.log(`✅ Verified: "${item}" navigation link is not visible`);
    }

    testLogger.log('✅ All navigation menu items are properly hidden for non-authenticated users');
  });

  test('Navigation menu should be visible only after successful authentication', async ({
    page,
  }) => {
    testLogger.log('Testing navigation menu appears after authentication');

    // 1. Start at root page (should be non-authenticated)
    await page.goto(WEB_BASE);
    await page.waitForTimeout(1000);

    // Verify no navigation initially
    const sidebarBefore = page.locator('aside nav');
    expect(await sidebarBefore.count()).toBe(0);
    testLogger.log('✅ Confirmed: No navigation menu before authentication');

    // 2. Go to login page and authenticate
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 3. Wait for redirect to root page
    await page.waitForURL(WEB_BASE + '/');
    testLogger.log('Successfully logged in and redirected to root');

    // 4. Now verify navigation menu is visible
    await page.waitForTimeout(1000); // Give time for auth state to update

    const sidebarAfter = page.locator('aside nav');
    expect(await sidebarAfter.count()).toBeGreaterThan(0);
    testLogger.log('✅ Confirmed: Navigation menu is visible after authentication');

    // 5. Verify specific navigation items are present
    const navigationItems = ['Resume Upload', 'Job Intake', 'Tailor', 'Applications', 'Settings'];

    for (const item of navigationItems) {
      await expect(page.locator(`nav a:has-text("${item}")`)).toBeVisible();
      testLogger.log(`✅ Verified: "${item}" navigation link is visible after login`);
    }

    testLogger.log('✅ All navigation menu items are properly visible after authentication');
  });
});
