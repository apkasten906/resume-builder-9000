import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Tests to prevent regression of the infinite loop issue that was caused by
 * circular useEffect dependencies in page.tsx
 */
test.describe('Infinite Loop Prevention Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies to start fresh
    await context.clearCookies();
  });

  test('should not make excessive API requests during authenticated session', async ({ page }) => {
    testLogger.info('Testing for excessive API requests during normal usage');

    // Track all API requests
    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    // Login first
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect and page load
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');
    testLogger.debug(`Initial requests after login: ${apiRequests.length}`);

    // Clear the initial login requests
    apiRequests.length = 0;

    // Wait and monitor for additional requests that shouldn't happen
    testLogger.info('Monitoring for excessive requests over 10 seconds...');
    await page.waitForTimeout(10000);

    // Count different types of API requests
    const authRequests = apiRequests.filter(url => url.includes('/api/auth/me'));
    const applicationRequests = apiRequests.filter(url => url.includes('/api/applications'));
    const totalRequests = apiRequests.length;

    testLogger.debug(`Auth requests: ${authRequests.length}`);
    testLogger.debug(`Application requests: ${applicationRequests.length}`);
    testLogger.debug(`Total API requests: ${totalRequests}`);

    // Assertions: Should not have excessive requests
    // Allow for some reasonable requests (periodic auth checks, etc.)
    expect(authRequests.length).toBeLessThan(5); // Max 5 auth checks in 10 seconds
    expect(applicationRequests.length).toBeLessThan(5); // Max 5 app requests in 10 seconds
    expect(totalRequests).toBeLessThan(10); // Max 10 total API requests in 10 seconds

    testLogger.info(`✅ No excessive API requests detected. Total: ${totalRequests}`);
  });

  test('should not create infinite loops when navigating between pages', async ({ page }) => {
    testLogger.info('Testing navigation between pages for infinite loops');

    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    // Login
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${WEB_BASE}/`);

    // Navigate between different pages
    const pages = ['/applications', '/settings', '/'];
    
    for (const pagePath of pages) {
      testLogger.debug(`Navigating to ${pagePath}`);
      
      // Clear previous requests
      apiRequests.length = 0;
      
      await page.goto(`${WEB_BASE}${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      // Wait a bit to see if requests keep coming
      await page.waitForTimeout(3000);
      
      const requestsForPage = apiRequests.length;
      testLogger.debug(`Requests for ${pagePath}: ${requestsForPage}`);
      
      // Should not have excessive requests for any page
      expect(requestsForPage).toBeLessThan(8); // Reasonable limit per page
    }

    testLogger.info('✅ No infinite loops detected during navigation');
  });

  test('should handle rapid authentication state changes without infinite loops', async ({ page }) => {
    testLogger.info('Testing rapid auth state changes');

    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    // Start unauthenticated
    await page.goto(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');

    // Login
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${WEB_BASE}/`);

    // Clear login requests
    apiRequests.length = 0;

    // Immediately logout
    await page.getByRole('button', { name: 'Log out' }).click();
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForTimeout(2000);

    // Check requests during rapid auth change
    const requestsDuringChange = apiRequests.length;
    testLogger.debug(`Requests during rapid auth change: ${requestsDuringChange}`);

    // Should handle the change without excessive requests
    expect(requestsDuringChange).toBeLessThan(10);

    testLogger.info('✅ Rapid auth state changes handled without infinite loops');
  });

  test('should not trigger useEffect loops on component re-renders', async ({ page }) => {
    testLogger.info('Testing component re-renders for useEffect loops');

    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    // Login and get to home page
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');

    // Clear initial requests
    apiRequests.length = 0;

    // Trigger re-renders by resizing window (common cause of re-renders)
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);

    // Check if viewport changes triggered excessive requests
    const requestsAfterResize = apiRequests.length;
    testLogger.debug(`Requests after viewport changes: ${requestsAfterResize}`);

    // Viewport changes should not trigger API requests
    expect(requestsAfterResize).toBeLessThan(3);

    testLogger.info('✅ Component re-renders do not trigger useEffect loops');
  });

  test('should detect if infinite loop occurs and fail test', async ({ page }) => {
    testLogger.info('Verification test: Should detect infinite loops if they occur');

    const apiRequests: string[] = [];
    let requestCount = 0;

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requestCount++;
        apiRequests.push(request.url());
        
        // If we detect a potential infinite loop, log it
        if (requestCount > 50) {
          testLogger.error(`INFINITE LOOP DETECTED: ${requestCount} requests made`);
          testLogger.error('Recent requests:', apiRequests.slice(-10));
        }
      }
    });

    // Login and wait
    await page.goto(`${WEB_BASE}/login`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'ValidPassword1!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${WEB_BASE}/`);

    // Monitor for a reasonable time
    await page.waitForTimeout(15000);

    testLogger.debug(`Final request count: ${requestCount}`);

    // This test should pass if our fixes are working
    // If it fails, we have a regression
    expect(requestCount).toBeLessThan(25); // Very generous limit
    
    if (requestCount > 25) {
      testLogger.error('🚨 INFINITE LOOP REGRESSION DETECTED 🚨');
      testLogger.error(`Made ${requestCount} requests in 15 seconds`);
      testLogger.error('This indicates the infinite loop bug has returned');
      throw new Error(`Infinite loop regression: ${requestCount} requests in 15 seconds`);
    }

    testLogger.info(`✅ Infinite loop prevention working correctly. Only ${requestCount} requests made.`);
  });
});