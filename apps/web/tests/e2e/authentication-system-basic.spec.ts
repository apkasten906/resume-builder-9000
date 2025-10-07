import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Simplified authentication tests that work with current system behavior
 * These tests focus on UI functionality rather than complete auth flows
 */
test.describe('Authentication System Tests', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    testLogger.log('Starting authentication test with clean state');
  });

  test('homepage shows Get Started button when unauthenticated', async ({ page }) => {
    testLogger.info('Testing unauthenticated homepage state');

    await page.goto(WEB_BASE);
    await page.waitForTimeout(1000);

    // Should show Get Started button
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();

    // Should not show navigation sidebar
    expect(await page.locator('aside nav').count()).toBe(0);

    testLogger.info('[PASS] Homepage shows correct unauthenticated state');
  });

  test('Get Started button navigates to login page', async ({ page }) => {
    testLogger.info('Testing navigation to login page');

    await page.goto(WEB_BASE);
    await page.getByRole('button', { name: 'Get Started' }).click();

    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');

    testLogger.info('[PASS] Get Started button navigates to login page');
  });

  test('login page has required form elements', async ({ page }) => {
    testLogger.info('Testing login page form elements');

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForTimeout(1000);

    // Verify form elements exist
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.getByRole('button', { name: 'Sign In' });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    testLogger.info('[PASS] Login page has all required form elements');
  });

  test('login form accepts user input', async ({ page }) => {
    testLogger.info('Testing login form input functionality');

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForTimeout(1000);

    // Test form input functionality
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');

    const emailValue = await page.locator('input[type="email"]').inputValue();
    const passwordValue = await page.locator('input[type="password"]').inputValue();

    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('testpassword');

    testLogger.info('[PASS] Login form accepts and retains user input');
  });

  test('login form can be submitted', async ({ page }) => {
    testLogger.info('Testing login form submission');

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForTimeout(1000);

    // Fill form and submit
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForTimeout(2000);

    // Form should submit and navigate away from login page
    const currentUrl = page.url();
    const isNotOnLoginForm = !currentUrl.includes('/login') || currentUrl.includes('/api/');
    expect(isNotOnLoginForm).toBe(true);

    testLogger.info('[PASS] Login form submits successfully');
  });
});
