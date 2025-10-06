import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Regression tests for navigation menu visibility based on authentication state
 * These tests prevent the bug where navigation was visible to unauthenticated users
 */
test.describe('Navigation Visibility Regression Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Start each test with clean state
    await context.clearCookies();
    testLogger.log('Cleared cookies for fresh test state');
  });

  test('navigation should remain hidden after page refresh when unauthenticated', async ({ page }) => {
    testLogger.info('Testing navigation remains hidden after refresh');

    // Visit home page while unauthenticated
    await page.goto(WEB_BASE);
    await page.waitForTimeout(2000);

    // Verify navigation is hidden initially
    const navBefore = page.locator('aside nav');
    expect(await navBefore.count()).toBe(0);
    testLogger.debug('Navigation correctly hidden on initial load');

    // Refresh the page
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify navigation is still hidden after refresh
    const navAfter = page.locator('aside nav');
    expect(await navAfter.count()).toBe(0);
    testLogger.info('✅ Navigation remains hidden after page refresh');
  });

  test('navigation should appear immediately after login and persist', async ({ page }) => {
    testLogger.info('Testing navigation appears after login');

    // Start unauthenticated - verify no navigation
    await page.goto(WEB_BASE);
    await page.waitForTimeout(1000);
    expect(await page.locator('aside nav').count()).toBe(0);

    // Login
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect and verify navigation appears
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForTimeout(2000);

    const navAfterLogin = page.locator('aside nav');
    expect(await navAfterLogin.count()).toBeGreaterThan(0);
    testLogger.debug('Navigation correctly appears after login');

    // Verify specific navigation items are present
    await expect(page.locator('nav a:has-text("Applications")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Settings")')).toBeVisible();

    // Refresh page and verify navigation persists
    await page.reload();
    await page.waitForTimeout(2000);

    const navAfterRefresh = page.locator('aside nav');
    expect(await navAfterRefresh.count()).toBeGreaterThan(0);
    testLogger.info('✅ Navigation persists after page refresh when authenticated');
  });

  test('navigation should disappear immediately after logout', async ({ page }) => {
    testLogger.info('Testing navigation disappears after logout');

    // Login first
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForTimeout(1000);

    // Verify navigation is present
    expect(await page.locator('aside nav').count()).toBeGreaterThan(0);
    testLogger.debug('Navigation present after login');

    // Logout
    await page.getByRole('button', { name: 'Log out' }).click();
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForTimeout(2000);

    // Verify navigation is hidden after logout
    const navAfterLogout = page.locator('aside nav');
    expect(await navAfterLogout.count()).toBe(0);
    testLogger.info('✅ Navigation correctly hidden after logout');

    // Verify Get Started button is visible (indicates unauthenticated state)
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.debug('Get Started button visible, confirming unauthenticated state');
  });

  test('navigation should not flicker during authentication state changes', async ({ page }) => {
    testLogger.info('Testing navigation does not flicker during auth changes');

    let navigationVisibilityChanges = 0;
    
    // Monitor navigation visibility changes
    page.on('domcontentloaded', async () => {
      const navCount = await page.locator('aside nav').count();
      if (navCount > 0) {
        navigationVisibilityChanges++;
        testLogger.debug(`Navigation visibility change detected: ${navigationVisibilityChanges}`);
      }
    });

    // Start unauthenticated
    await page.goto(WEB_BASE);
    await page.waitForTimeout(1000);

    // Login
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForTimeout(2000);

    // Navigation should appear cleanly without flickering
    expect(navigationVisibilityChanges).toBeLessThanOrEqual(1);
    testLogger.info('✅ Navigation appears without flickering during login');
  });

  test('navigation should be hidden on all pages when unauthenticated', async ({ page }) => {
    testLogger.info('Testing navigation hidden on all pages when unauthenticated');

    const testPages = ['/', '/login'];

    for (const pagePath of testPages) {
      testLogger.debug(`Testing navigation visibility on: ${pagePath}`);
      
      await page.goto(`${WEB_BASE}${pagePath}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      const navCount = await page.locator('aside nav').count();
      expect(navCount).toBe(0);
      
      testLogger.debug(`✅ Navigation correctly hidden on ${pagePath}`);
    }

    testLogger.info('✅ Navigation hidden on all tested pages when unauthenticated');
  });

  test('navigation should be visible on all protected pages when authenticated', async ({ page }) => {
    testLogger.info('Testing navigation visible on all pages when authenticated');

    // Login first
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${WEB_BASE}/`);

    const testPages = ['/', '/applications', '/settings'];

    for (const pagePath of testPages) {
      testLogger.debug(`Testing navigation visibility on: ${pagePath}`);
      
      await page.goto(`${WEB_BASE}${pagePath}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      const navCount = await page.locator('aside nav').count();
      expect(navCount).toBeGreaterThan(0);
      
      // Verify key navigation items are present
      await expect(page.locator('nav a:has-text("Applications")')).toBeVisible();
      
      testLogger.debug(`✅ Navigation correctly visible on ${pagePath}`);
    }

    testLogger.info('✅ Navigation visible on all tested pages when authenticated');
  });

  test('should handle race conditions between auth check and navigation render', async ({ page }) => {
    testLogger.info('Testing race condition handling between auth and navigation');

    // Add network delay to simulate slow auth checks
    await page.route('**/api/auth/me', async route => {
      // Delay the auth response to test race conditions
      await new Promise(resolve => setTimeout(resolve, 500));
      route.continue();
    });

    // Login with delayed auth responses
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect and auth resolution
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForTimeout(2000); // Allow time for delayed auth to resolve

    // Navigation should still appear correctly despite the delay
    const navCount = await page.locator('aside nav').count();
    expect(navCount).toBeGreaterThan(0);

    testLogger.info('✅ Navigation handles auth delays without issues');
  });

  test('should prevent navigation from appearing before authentication is verified', async ({ page }) => {
    testLogger.info('Testing navigation does not appear before auth verification');

    let navigationAppearedBeforeAuth = false;

    // Monitor for navigation appearance
    page.on('domcontentloaded', async () => {
      try {
        const navCount = await page.locator('aside nav').count();
        const authButtonPresent = await page.getByRole('button', { name: 'Get Started' }).isVisible();
        
        // If navigation appears while Get Started button is still visible, 
        // that means navigation appeared before authentication was properly verified
        if (navCount > 0 && authButtonPresent) {
          navigationAppearedBeforeAuth = true;
          testLogger.warn('Navigation appeared before authentication was verified!');
        }
      } catch (error) {
        // Ignore errors during monitoring
      }
    });

    // Navigate to home page and let auth check complete naturally
    await page.goto(WEB_BASE);
    await page.waitForTimeout(3000); // Wait for any auth checks to complete

    expect(navigationAppearedBeforeAuth).toBe(false);
    testLogger.info('✅ Navigation does not appear before authentication verification');
  });
});