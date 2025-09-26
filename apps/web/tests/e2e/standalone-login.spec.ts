// apps/web/tests/e2e/standalone-login.spec.ts
import { test, expect } from '@playwright/test';

// Force port 3000 since we know that's where the server is running
process.env.WEB_BASE = 'http://localhost:3000';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000'; // Note: using 3000 since that's where the server is running

test('standalone login test', async ({ page }) => {
  // Go to the login page
  console.log('Navigating to login page...');
  await page.goto(`${WEB_BASE}/login`);

  // Take a screenshot to debug
  await page.screenshot({ path: '../../test-results/standalone-login-before.png', fullPage: true });
  console.log('Current URL:', page.url());

  // Log the HTML to see what's on the page
  const htmlContent = await page.content();
  console.log('Page HTML excerpt:', htmlContent.substring(0, 500) + '...');

  // Check if we're getting a 404 page
  const is404 = (await page.locator('text="404"').count()) > 0;
  if (is404) {
    console.error('ERROR: Got a 404 page instead of login page!');
    return;
  }

  // Try to find and fill the login form
  const emailInput = page.getByLabel('Email');
  const emailExists = (await emailInput.count()) > 0;
  console.log('Email input found:', emailExists);

  if (!emailExists) {
    console.error('Could not find Email input field!');
    return;
  }

  // Fill login form
  await emailInput.fill('user@example.com');
  await page.getByLabel('Password').fill('ValidPassword1!');

  // Click login button
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Take another screenshot after clicking login
  await page.screenshot({ path: '../../test-results/standalone-login-after.png', fullPage: true });

  // Check cookies
  const cookies = await page.context().cookies();
  console.log('Cookies after login attempt:', cookies);

  // Check current URL
  console.log('Final URL after login attempt:', page.url());

  // Check if we were redirected to applications page
  const redirectedToApp = page.url().includes('/applications');
  console.log('Redirected to applications:', redirectedToApp);
});
