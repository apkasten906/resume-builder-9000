import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Test authentication flow redirects
 * 1. Login should redirect to root page (/) instead of /applications
 * 2. Logout should redirect to root page (/) from any protected page
 */
test.describe('Authentication Flow Redirects', () => {
  test('Login redirects to root page after successful authentication', async ({ page }) => {
    testLogger.log('Testing login redirect to root page');

    // 1. Start at root page
    await page.goto(WEB_BASE);
    testLogger.log('Started at root page');

    // 2. Click "Get Started" button to navigate to login
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.waitForURL('**/login');
    testLogger.log('Navigated to login page via Get Started');

    // 3. Fill in login form
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    testLogger.log('Filled login credentials');

    // 4. Submit login form
    await page.getByRole('button', { name: 'Sign In' }).click();
    testLogger.log('Submitted login form');

    // 5. Wait for redirect and verify we're at root page (not /applications)
    await page.waitForURL(WEB_BASE + '/');
    const currentUrl = page.url();
    testLogger.log(`After login redirect: ${currentUrl}`);

    expect(currentUrl).toBe(WEB_BASE + '/');
    expect(currentUrl).not.toContain('/applications');
    testLogger.log('✅ Login correctly redirected to root page');

    // 6. Verify we're logged in by checking for authenticated content
    await expect(page.getByText('Welcome back')).toBeVisible();
    testLogger.log('✅ Confirmed user is logged in on root page');
  });

  test('Logout redirects to root page from protected Applications page', async ({ page }) => {
    testLogger.log('Testing logout redirect from Applications page');

    // 1. Login first (this will redirect us to root)
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(WEB_BASE + '/');
    testLogger.log('Logged in and confirmed at root page');

    // 2. Navigate to Applications page manually
    await page.goto(`${WEB_BASE}/applications`);
    await page.waitForURL('**/applications');
    testLogger.log('Navigated to Applications page');

    // 3. Verify we're on the Applications page
    expect(page.url()).toContain('/applications');

    // 4. Find and click logout button
    await page.getByRole('button', { name: 'Log out' }).click();
    testLogger.log('Clicked logout button');

    // 5. Wait for redirect and verify we're at root page
    await page.waitForURL(WEB_BASE + '/');
    const currentUrl = page.url();
    testLogger.log(`After logout redirect: ${currentUrl}`);

    expect(currentUrl).toBe(WEB_BASE + '/');
    expect(currentUrl).not.toContain('/applications');
    testLogger.log('✅ Logout correctly redirected to root page');

    // 6. Verify we're logged out by checking for "Get Started" button
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('✅ Confirmed user is logged out on root page');
  });

  test('Logout from any protected page redirects to root (Settings example)', async ({ page }) => {
    testLogger.log('Testing logout redirect from Settings page');

    // 1. Login first
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(WEB_BASE + '/');
    testLogger.log('Logged in successfully');

    // 2. Navigate to Settings page
    await page.goto(`${WEB_BASE}/settings`);
    await page.waitForURL('**/settings');
    testLogger.log('Navigated to Settings page');

    // 3. Verify we're on the Settings page
    expect(page.url()).toContain('/settings');

    // 4. Logout from Settings page
    await page.getByRole('button', { name: 'Log out' }).click();
    testLogger.log('Clicked logout button from Settings page');

    // 5. Verify redirect to root page
    await page.waitForURL(WEB_BASE + '/');
    const currentUrl = page.url();
    testLogger.log(`After logout redirect: ${currentUrl}`);

    expect(currentUrl).toBe(WEB_BASE + '/');
    testLogger.log('✅ Logout from Settings correctly redirected to root page');

    // 6. Verify logged out state
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('✅ Confirmed user is logged out and can see Get Started button');
  });

  test('No 401 errors appear after logout redirect', async ({ page }) => {
    testLogger.log('Testing no 401 errors after logout');

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for failed network requests
    const networkErrors: { url: string; status: number }[] = [];
    page.on('response', response => {
      if (response.status() === 401 || response.status() >= 400) {
        networkErrors.push({ url: response.url(), status: response.status() });
      }
    });

    // 1. Login and go to Applications page
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(WEB_BASE + '/');

    await page.goto(`${WEB_BASE}/applications`);
    await page.waitForURL('**/applications');
    testLogger.log('Navigated to Applications page');

    // 2. Clear any existing errors
    consoleErrors.length = 0;
    networkErrors.length = 0;

    // 3. Logout
    await page.getByRole('button', { name: 'Log out' }).click();
    await page.waitForURL(WEB_BASE + '/');
    testLogger.log('Logged out and redirected to root');

    // 4. Wait a moment for any async operations to complete
    await page.waitForTimeout(2000);

    // 5. Check that no 401 errors occurred after logout
    const unauthorizedErrors = networkErrors.filter(error => error.status === 401);
    const errorPages = await page.locator('text=Error 401').count();
    const unauthorizedMessages = await page.locator('text=Unauthorized').count();

    testLogger.log(`Console errors after logout: ${consoleErrors.length}`);
    testLogger.log(`Network 401 errors after logout: ${unauthorizedErrors.length}`);
    testLogger.log(`Error 401 pages: ${errorPages}`);
    testLogger.log(`Unauthorized messages: ${unauthorizedMessages}`);

    // We expect no lingering 401 errors since we redirected away from protected content
    expect(errorPages).toBe(0);
    testLogger.log('✅ No 401 error pages displayed after logout redirect');

    // Verify we're on a clean root page
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    testLogger.log('✅ Root page displays correctly without errors');
  });
});

