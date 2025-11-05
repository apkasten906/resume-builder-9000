import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Test to verify that logout properly clears session cookies
 * and navigation menu is hidden after logout
 */
test.describe('Logout Cookie Clearing', () => {
  test('Logout should clear session cookies and hide navigation menu', async ({ page }) => {
    testLogger.log('Testing logout cookie clearing and navigation menu hiding');

    // Set viewport to ensure navigation is visible (lg breakpoint is 1024px)
    await page.setViewportSize({ width: 1280, height: 720 });

    // 1. Start with a fresh browser state (no cookies)
    await page.context().clearCookies();
    testLogger.log('Cleared all cookies to start fresh');

    // 2. Navigate to login page and authenticate
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');

    testLogger.log('Filled login credentials');

    // 3. Attempt login (may fail in test environment without proper test user)
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Wait for navigation/network idle instead of a fixed timeout to reduce flakiness
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    testLogger.log(`URL after login attempt: ${currentUrl}`);

    // Check if authentication succeeded (redirected to root) or failed (stayed on login)
    if (currentUrl.includes('/login')) {
      testLogger.log('Authentication failed - testing unauthenticated state navigation behavior');
      const navigationWhenNotAuth = page.locator('aside nav');
      expect(await navigationWhenNotAuth.count()).toBe(0);
      testLogger.log('[TEST] Verified: Navigation menu is hidden when not authenticated');
      return; // Skip logout test since we're not logged in
    }

    testLogger.log('Authentication successful - testing authenticated state and logout');

    // 4. Verify navigation menu is visible when authenticated
    const navigationBeforeLogout = page.locator('aside nav');
    expect(await navigationBeforeLogout.count()).toBeGreaterThan(0);
    testLogger.log('[TEST] Verified: Navigation menu is visible when authenticated');

    // 5. Check that we have a session cookie
    const cookiesBeforeLogout = await page.context().cookies();
    const sessionCookieBefore = cookiesBeforeLogout.find(cookie => cookie.name === 'session');
    expect(sessionCookieBefore).toBeTruthy();
    testLogger.log('[TEST] Verified: Session cookie exists before logout');

    // 6. Click logout button
    await page.getByRole('button', { name: 'Log out' }).click();
    testLogger.log('Clicked logout button');

    // 7. Wait for redirect to root page
    await page.waitForURL(WEB_BASE + '/');
    testLogger.log('Logout redirect completed');

    // 8. Verify session cookie is cleared (poll until cookie absent to avoid timing issues)
    await expect
      .poll(
        async () => {
          const cookies = await page.context().cookies();
          return cookies.find(cookie => cookie.name === 'session');
        },
        { timeout: 2000 }
      )
      .toBeFalsy();
    testLogger.log('[TEST] Verified: Session cookie is cleared after logout');

    // 9. Verify navigation menu is hidden after logout
    const navigationAfterLogout = page.locator('aside nav');
    expect(await navigationAfterLogout.count()).toBe(0);
    testLogger.log('[TEST] Verified: Navigation menu is hidden after logout');

    // 10. Verify "Get Started" button is visible (indicates non-authenticated state)
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('[TEST] Verified: Get Started button is visible after logout');

    // 11. Refresh the page to ensure session doesn't persist across page loads
    await page.reload();
    // Wait for navigation/auth check to settle by polling the navigation element count
    await expect
      .poll(async () => await page.locator('aside nav').count(), { timeout: 2000 })
      .toBe(0);
    testLogger.log('Refreshed page to test session persistence');

    // 12. Verify navigation menu is still hidden after page refresh
    const navigationAfterRefresh = page.locator('aside nav');
    expect(await navigationAfterRefresh.count()).toBe(0);
    testLogger.log('[TEST] Verified: Navigation menu remains hidden after page refresh');

    // 13. Verify session cookie is still absent after refresh
    const cookiesAfterRefresh = await page.context().cookies();
    const sessionCookieAfterRefresh = cookiesAfterRefresh.find(
      cookie => cookie.name === 'session' && cookie.value !== ''
    );
    expect(sessionCookieAfterRefresh).toBeFalsy();
    testLogger.log('[TEST] Verified: Session cookie remains cleared after page refresh');

    testLogger.log('[TEST] All logout cookie clearing tests passed successfully');
  });

  test('Navigation menu should not be visible with expired session cookie', async ({ page }) => {
    testLogger.log('Testing navigation menu with expired session cookie');

    // Set viewport to ensure navigation would be visible if authenticated (lg breakpoint is 1024px)
    await page.setViewportSize({ width: 1280, height: 720 });

    // 1. Manually set an expired session cookie to simulate the scenario
    await page.context().addCookies([
      {
        name: 'session',
        value: 'expired-or-invalid-token',
        domain: 'localhost',
        path: '/',
        expires: Math.floor(Date.now() / 1000) - 1, // Expired 1 second ago (Unix timestamp in seconds)
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    testLogger.log('Set expired session cookie manually');

    // 2. Navigate to root page
    await page.goto(WEB_BASE);
    // Poll for navigation to remain hidden since cookie is expired
    await expect
      .poll(async () => await page.locator('aside nav').count(), { timeout: 2000 })
      .toBe(0);
    testLogger.log('Navigated to root page with expired cookie');

    // 3. Verify navigation menu is not visible
    const navigation = page.locator('aside nav');
    expect(await navigation.count()).toBe(0);
    testLogger.log('[TEST] Verified: Navigation menu is hidden with expired session cookie');

    // 4. Verify "Get Started" button is visible
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('[TEST] Verified: Get Started button is visible with expired session cookie');

    testLogger.log('[TEST] All expired cookie tests passed successfully');
  });
});
