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

    // 1. Start with a fresh browser state (no cookies)
    await page.context().clearCookies();
    testLogger.log('Cleared all cookies to start fresh');

    // 2. Navigate to login page and authenticate
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');

    testLogger.log('Filled login credentials');

    // 3. Login and verify we're redirected to root with navigation visible
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(WEB_BASE + '/');
    testLogger.log('Successfully logged in and redirected to root');

    // 4. Verify navigation menu is visible when authenticated
    const navigationBeforeLogout = page.locator('aside nav');
    expect(await navigationBeforeLogout.count()).toBeGreaterThan(0);
    testLogger.log('✅ Verified: Navigation menu is visible when authenticated');

    // 5. Check that we have a session cookie
    const cookiesBeforeLogout = await page.context().cookies();
    const sessionCookieBefore = cookiesBeforeLogout.find(cookie => cookie.name === 'session');
    expect(sessionCookieBefore).toBeTruthy();
    testLogger.log('✅ Verified: Session cookie exists before logout');

    // 6. Click logout button
    await page.getByRole('button', { name: 'Log out' }).click();
    testLogger.log('Clicked logout button');

    // 7. Wait for redirect to root page
    await page.waitForURL(WEB_BASE + '/');
    await page.waitForTimeout(1000); // Give time for logout process to complete
    testLogger.log('Logout redirect completed');

    // 8. Verify session cookie is cleared
    const cookiesAfterLogout = await page.context().cookies();
    const sessionCookieAfter = cookiesAfterLogout.find(
      cookie => cookie.name === 'session' && cookie.value !== ''
    );
    expect(sessionCookieAfter).toBeFalsy();
    testLogger.log('✅ Verified: Session cookie is cleared after logout');

    // 9. Verify navigation menu is hidden after logout
    const navigationAfterLogout = page.locator('aside nav');
    expect(await navigationAfterLogout.count()).toBe(0);
    testLogger.log('✅ Verified: Navigation menu is hidden after logout');

    // 10. Verify "Get Started" button is visible (indicates non-authenticated state)
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('✅ Verified: Get Started button is visible after logout');

    // 11. Refresh the page to ensure session doesn't persist across page loads
    await page.reload();
    await page.waitForTimeout(1000); // Give time for auth check
    testLogger.log('Refreshed page to test session persistence');

    // 12. Verify navigation menu is still hidden after page refresh
    const navigationAfterRefresh = page.locator('aside nav');
    expect(await navigationAfterRefresh.count()).toBe(0);
    testLogger.log('✅ Verified: Navigation menu remains hidden after page refresh');

    // 13. Verify session cookie is still absent after refresh
    const cookiesAfterRefresh = await page.context().cookies();
    const sessionCookieAfterRefresh = cookiesAfterRefresh.find(
      cookie => cookie.name === 'session' && cookie.value !== ''
    );
    expect(sessionCookieAfterRefresh).toBeFalsy();
    testLogger.log('✅ Verified: Session cookie remains cleared after page refresh');

    testLogger.log('✅ All logout cookie clearing tests passed successfully');
  });

  test('Navigation menu should not be visible with expired session cookie', async ({ page }) => {
    testLogger.log('Testing navigation menu with expired session cookie');

    // 1. Manually set an expired session cookie to simulate the scenario
    await page.context().addCookies([
      {
        name: 'session',
        value: 'expired-or-invalid-token',
        domain: 'localhost',
        path: '/',
        expires: Date.now() - 1000, // Expired 1 second ago
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    testLogger.log('Set expired session cookie manually');

    // 2. Navigate to root page
    await page.goto(WEB_BASE);
    await page.waitForTimeout(2000); // Give time for auth check
    testLogger.log('Navigated to root page with expired cookie');

    // 3. Verify navigation menu is not visible
    const navigation = page.locator('aside nav');
    expect(await navigation.count()).toBe(0);
    testLogger.log('✅ Verified: Navigation menu is hidden with expired session cookie');

    // 4. Verify "Get Started" button is visible
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('✅ Verified: Get Started button is visible with expired session cookie');

    testLogger.log('✅ All expired cookie tests passed successfully');
  });
});
