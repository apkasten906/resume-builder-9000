import { test, expect } from '@playwright/test';

// Simple console logging for debugging
const testLogger = {
  log: (msg: string): void => console.log(`[TEST] ${msg}`),
  debug: (msg: string): void => console.log(`[DEBUG] ${msg}`),
};
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

test.describe('Infinite Loop Prevention - Basic Tests', () => {
  test.beforeAll(async () => {
    // Setup if needed
  });

  test('should access login page without infinite requests', async ({ page }) => {
    testLogger.log('Testing login page access without infinite loops');

    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Give it a moment for any delayed requests
    await page.waitForTimeout(3000);

    testLogger.debug(`API requests made: ${apiRequests.length}`);

    // Should not have excessive requests
    expect(apiRequests.length).toBeLessThan(10);

    // Should see login form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should handle form interaction without infinite loops', async ({ page }) => {
    testLogger.log('Testing form interaction without infinite loops');

    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Interact with form fields
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');

    // Wait for any reactions
    await page.waitForTimeout(2000);

    testLogger.debug(`API requests during form interaction: ${apiRequests.length}`);

    // Should not trigger excessive API calls from form interaction
    expect(apiRequests.length).toBeLessThan(5);
  });

  test('should handle page navigation without infinite loops', async ({ page }) => {
    testLogger.log('Testing page navigation without infinite loops');

    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    // Test navigation between public pages
    await page.goto(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const initialRequests = apiRequests.length;
    testLogger.debug(`Initial requests: ${initialRequests}`);

    // Navigate to login
    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Navigate back to home
    await page.goto(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    testLogger.debug(`Total API requests after navigation: ${apiRequests.length}`);

    // Should not have excessive requests from navigation
    expect(apiRequests.length).toBeLessThan(15);
  });

  test('should detect potential infinite loop patterns', async ({ page }) => {
    testLogger.log('Testing infinite loop detection');

    const apiRequests: { url: string; timestamp: number }[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          timestamp: Date.now(),
        });
      }
    });

    await page.goto(`${WEB_BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Monitor for 10 seconds
    await page.waitForTimeout(10000);

    testLogger.debug(`Total requests in 10 seconds: ${apiRequests.length}`);

    // Check for rapid repeated requests (potential infinite loop)
    const urlCounts = new Map<string, number>();
    apiRequests.forEach(req => {
      const count = urlCounts.get(req.url) || 0;
      urlCounts.set(req.url, count + 1);
    });

    const maxRepeats = Math.max(...Array.from(urlCounts.values()));
    testLogger.debug(`Maximum repeats of same URL: ${maxRepeats}`);

    // Should not have the same URL requested more than 5 times
    expect(maxRepeats).toBeLessThan(6);
  });
});
