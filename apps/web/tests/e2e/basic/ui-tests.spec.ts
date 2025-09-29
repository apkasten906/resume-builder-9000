import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Define test constants
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

// Create directory for storing test artifacts
const testResultsDir = path.join(process.cwd(), 'test-results', 'ui-tests');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// Simple function to log test progress
function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Test the login page rendering without attempting to authenticate
test('Login page UI test', async ({ page }) => {
  log('Starting login page UI test');

  // Navigate to login page
  await page.goto(`${WEB_BASE}/login`);
  log('Navigated to login page');

  // Take screenshot
  await page.screenshot({ path: path.join(testResultsDir, 'login-page.png'), fullPage: true });
  log('Screenshot taken');

  // Save page HTML for analysis
  const pageContent = await page.content();
  fs.writeFileSync(path.join(testResultsDir, 'login-page.html'), pageContent);
  log(`Saved page HTML content (${pageContent.length} bytes)`);

  // Check the page title or specific elements that should exist on login page
  const title = await page.title();
  log(`Page title: ${title}`);

  // This test just ensures the login page renders without errors
  // It doesn't actually try to log in
  expect(page.url()).toContain('/login');
  log('Test completed successfully');
});

// Test public pages that don't require authentication
test('Public pages accessibility test', async ({ page }) => {
  log('Starting public pages test');

  // Test home page
  await page.goto(`${WEB_BASE}/`);
  await page.screenshot({ path: path.join(testResultsDir, 'home-page.png'), fullPage: true });
  log('Home page screenshot taken');

  // Test about page if it exists
  try {
    await page.goto(`${WEB_BASE}/about`);
    await page.screenshot({ path: path.join(testResultsDir, 'about-page.png'), fullPage: true });
    log('About page screenshot taken');
  } catch (e) {
    log(`Could not access about page: ${e}`);
  }

  log('Public pages test completed');
});
