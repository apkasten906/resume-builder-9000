import { test, type Page } from '@playwright/test';
import { testLogger } from '../utils/test-logger';

// Note: Environment variables should be set before running tests
// We will rely on the existing environment

// Simple test that doesn't rely on database connections
test('Basic page rendering test - No auth needed', async ({ page }: { page: Page }) => {
  // Visit the public pages that don't require authentication
  await page.goto('http://localhost:3000/');
  testLogger.log('Visited home page');

  // Take screenshots for debugging
  await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });

  // Log the page content
  const content = await page.content();
  testLogger.log(`Page content length: ${content.length} characters`);

  // Wait a moment to see if any errors appear
  await page.waitForTimeout(1000);
});
