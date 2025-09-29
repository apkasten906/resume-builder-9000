import { test } from '@playwright/test';

// Note: Environment variables should be set before running tests
// We will rely on the existing environment

// Simple test that doesn't rely on database connections
test('Basic page rendering test - No auth needed', async ({ page }) => {
  // Visit the public pages that don't require authentication
  await page.goto('http://localhost:3000/');
  console.log('Visited home page');

  // Take screenshots for debugging
  await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });

  // Log the page content
  const content = await page.content();
  console.log(`Page content length: ${content.length} characters`);

  // Wait a moment to see if any errors appear
  await page.waitForTimeout(1000);
});
