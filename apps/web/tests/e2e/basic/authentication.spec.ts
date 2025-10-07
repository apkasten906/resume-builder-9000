import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { testLogger } from '../utils/test-logger';

// Constants
const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const TEST_USERNAME = 'user@example.com';
const TEST_PASSWORD = 'password123';

// Helper function to log test steps with timestamps
function logStep(message: string): void {
  const timestamp = new Date().toISOString();
  testLogger.log(`[${timestamp}] ${message}`);

  // Also log to file for persistence
  const logDir = path.join(process.cwd(), 'test-results', 'auth-logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.appendFileSync(path.join(logDir, 'auth-test.log'), `[${timestamp}] ${message}\n`);
}

// This test attempts to do a basic login via API first, then UI if API fails
test('Basic authentication test with detailed logging', async ({ page, request }) => {
  logStep('Starting authentication test');

  // First, try API-based login (direct route to set cookie)
  logStep('Attempting API login first');
  try {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: TEST_USERNAME,
        password: TEST_PASSWORD,
      },
    });

    logStep(`API login response status: ${response.status()}`);

    if (response.ok()) {
      const cookies = await response.headers()['set-cookie'];
      logStep(`API login cookies: ${cookies ? 'Found' : 'Not found'}`);

      if (cookies) {
        // Parse the cookies and set them on the page
        const sessionCookie = cookies.split(';')[0];
        logStep(`Session cookie: ${sessionCookie}`);

        // Apply the cookie to our page
        await page.context().addCookies([
          {
            name: sessionCookie.split('=')[0],
            value: sessionCookie.split('=')[1],
            domain: 'localhost',
            path: '/',
          },
        ]);

        logStep('Session cookie set via API');
      }
    } else {
      logStep(`API login failed with status ${response.status()}`);
      const body = await response.text();
      logStep(`API response body: ${body.substring(0, 500)}...`);
    }
  } catch (error) {
    logStep(`Error during API login: ${error}`);
  }

  // Now try UI-based login as a fallback
  logStep('Attempting UI login as fallback');

  // Navigate to the login page
  await page.goto(`${WEB_BASE}/login`);
  logStep('Navigated to login page');

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/auth-logs/login-page.png', fullPage: true });
  logStep('Screenshot taken of login page');

  // Log page HTML for debugging
  const pageContent = await page.content();
  logStep(`Page content length: ${pageContent.length} characters`);
  fs.writeFileSync('test-results/auth-logs/login-page.html', pageContent);

  // Log all form elements on the page
  const formCount = await page.locator('form').count();
  logStep(`Found ${formCount} forms on the page`);

  // Log all input elements
  const inputElements = await page.locator('input').all();
  logStep(`Found ${inputElements.length} input elements on the page`);

  for (let i = 0; i < inputElements.length; i++) {
    const input = inputElements[i];
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    logStep(`Input #${i}: type=${type}, name=${name}, id=${id}`);
  }

  // Check if we can find email input
  try {
    // Try different selectors for email input
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      'input#email',
      'input[placeholder*="email" i]',
      'input[placeholder*="username" i]',
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      const count = await page.locator(selector).count();
      logStep(`Selector "${selector}" found ${count} elements`);

      if (count > 0) {
        emailInput = page.locator(selector).first();
        logStep(`Found email input with selector: ${selector}`);
        break;
      }
    }

    if (emailInput) {
      await emailInput.fill(TEST_USERNAME);
      logStep('Filled email input');
    } else {
      logStep('Could not find email input');
    }

    // Try different selectors for password input
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input#password',
      'input[placeholder*="password" i]',
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      const count = await page.locator(selector).count();
      logStep(`Selector "${selector}" found ${count} elements`);

      if (count > 0) {
        passwordInput = page.locator(selector).first();
        logStep(`Found password input with selector: ${selector}`);
        break;
      }
    }

    if (passwordInput) {
      await passwordInput.fill(TEST_PASSWORD);
      logStep('Filled password input');
    } else {
      logStep('Could not find password input');
    }

    // Try different selectors for login button
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'button:has-text("Log in")',
      'button.login-button',
      'button.submit',
    ];

    let submitButton = null;
    for (const selector of buttonSelectors) {
      const count = await page.locator(selector).count();
      logStep(`Selector "${selector}" found ${count} elements`);

      if (count > 0) {
        submitButton = page.locator(selector).first();
        logStep(`Found submit button with selector: ${selector}`);
        break;
      }
    }

    if (submitButton) {
      await submitButton.click();
      logStep('Clicked submit button');

      // Wait for navigation or for any result
      try {
        await page.waitForNavigation({ timeout: 10000 });
        logStep('Navigation occurred after login');
      } catch (e) {
        logStep(`No navigation occurred: ${e}`);
      }
    } else {
      logStep('Could not find submit button, trying to press Enter on password field');
      if (passwordInput) {
        await passwordInput.press('Enter');
        logStep('Pressed Enter on password field');

        try {
          await page.waitForNavigation({ timeout: 10000 });
          logStep('Navigation occurred after Enter key');
        } catch (e) {
          logStep(`No navigation occurred after Enter key: ${e}`);
        }
      }
    }
  } catch (error) {
    logStep(`Error during UI login: ${error}`);
  }

  // Take a screenshot after login attempt
  await page.screenshot({ path: 'test-results/auth-logs/after-login.png', fullPage: true });
  logStep('Screenshot taken after login attempt');

  // Check if we're logged in by looking for common post-login elements
  const isLoggedIn = await page.evaluate(() => {
    // Check URL for common post-login paths
    const url = window.location.pathname;
    if (url.includes('/applications') || url.includes('/dashboard') || url.includes('/home')) {
      return true;
    }

    // Check for logout button or user menu
    const logoutButton = document.querySelector(
      'button:not([hidden]):not([disabled]):not([style*="display: none"]):not([style*="visibility: hidden"]):is(:contains("Logout"), :contains("Sign out"), :contains("Log out"))'
    );
    const userMenu = document.querySelector('.user-menu, .avatar, .user-profile');

    return !!logoutButton || !!userMenu;
  });

  logStep(`Login status check: ${isLoggedIn ? 'Appears logged in' : 'Not logged in'}`);

  // Try loading a protected page directly
  logStep('Trying to access a protected page directly');
  await page.goto(`${WEB_BASE}/applications`);

  // Take a screenshot of the protected page
  await page.screenshot({ path: 'test-results/auth-logs/protected-page.png', fullPage: true });
  logStep('Screenshot taken of protected page attempt');

  // Check if we were redirected to login
  const currentUrl = page.url();
  logStep(`Current URL after protected page request: ${currentUrl}`);

  // Basic assertion
  expect(page.url()).not.toContain('/login');
});

