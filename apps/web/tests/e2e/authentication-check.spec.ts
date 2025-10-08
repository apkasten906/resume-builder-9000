import { test, Page, APIRequestContext, Cookie } from '@playwright/test';
import { testLogger } from './utils/test-logger';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

/**
 * Test specifically focused on the authentication flow
 */
test('Authentication flow check', async ({
  page,
  request,
}: {
  page: Page;
  request: APIRequestContext;
}) => {
  testLogger.log('Starting authentication flow test');

  // Step 1: Try direct API login
  testLogger.log('Testing direct API login...');
  const loginResponse = await request.post(`${API_BASE}/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: 'user@example.com',
      password: 'ValidPassword1!',
    },
  });

  testLogger.log(`API Login status: ${loginResponse.status()}`);
  if (loginResponse.ok()) {
    const data = await loginResponse.json();
    testLogger.log('Login response:', data);
    testLogger.log('Token received:', !!data.token);
  } else {
    const errorText = await loginResponse.text();
    testLogger.error('Login error response:', errorText);
  }

  // Step 2: Check UI login flow
  testLogger.log('Testing UI login flow...');
  await page.goto(`${WEB_BASE}/login`);
  await page.waitForLoadState('networkidle');

  // Check if login form is present
  const emailFieldVisible = await page.getByLabel('Email').isVisible();
  const passwordFieldVisible = await page.getByLabel('Password').isVisible();

  testLogger.log(
    `Login form fields visible: Email=${emailFieldVisible}, Password=${passwordFieldVisible}`
  );

  if (emailFieldVisible && passwordFieldVisible) {
    // Fill and submit login form
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();

    // Wait for navigation or response
    await page.waitForTimeout(2000);

    // Check if we got redirected away from login page
    const currentUrl = page.url();
    testLogger.log(`After login, current URL: ${currentUrl}`);
    const loginSuccessful = !currentUrl.includes('/login');
    testLogger.log(`Login appears successful: ${loginSuccessful}`);

    // Check cookies after login
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c: Cookie) => c.name === 'session');
    testLogger.log('Session cookie present after login:', !!sessionCookie);

    if (sessionCookie) {
      testLogger.log('Session cookie details:');
      testLogger.log(`- Domain: ${sessionCookie.domain}`);
      testLogger.log(`- Path: ${sessionCookie.path}`);
      testLogger.log(`- Expires: ${new Date(sessionCookie.expires * 1000).toISOString()}`);
      testLogger.log(`- HttpOnly: ${sessionCookie.httpOnly}`);
      testLogger.log(`- Secure: ${sessionCookie.secure}`);
      testLogger.log(`- SameSite: ${sessionCookie.sameSite}`);

      // Try a simple API call with this cookie
      testLogger.log('Testing API call with session cookie...');
      const userResponse = await request.get(`${API_BASE}/auth/me`, {
        headers: { Cookie: `session=${sessionCookie.value}` },
      });

      testLogger.log(`/auth/me status: ${userResponse.status()}`);
      if (userResponse.ok()) {
        const userData = await userResponse.json();
        testLogger.log('User data:', userData);
      } else {
        const errorText = await userResponse.text();
        testLogger.log('/auth/me error:', errorText);
      }
    }
  }

  // Step 3: Check if hardcoded token works
  testLogger.log('Testing hardcoded token...');

  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTkwODUyNzcsImV4cCI6MTc1OTY5MDA3N30.CX1f-7D9mZg1nGrvyQkKgCTB1lQn8mVT_tTA-jfWtZQ';

  const tokenResponse = await request.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${testToken}` },
  });

  testLogger.log(`/auth/me with bearer token status: ${tokenResponse.status()}`);
  if (tokenResponse.ok()) {
    const tokenData = await tokenResponse.json();
    testLogger.log('Token auth data:', tokenData);
  } else {
    const errorText = await tokenResponse.text();
    testLogger.log('Token auth error:', errorText);
  }

  // Also try as cookie
  const cookieResponse = await request.get(`${API_BASE}/auth/me`, {
    headers: { Cookie: `session=${testToken}` },
  });

  testLogger.log(`/auth/me with cookie token status: ${cookieResponse.status()}`);
  if (cookieResponse.ok()) {
    const cookieData = await cookieResponse.json();
    testLogger.log('Cookie auth data:', cookieData);
  } else {
    const errorText = await cookieResponse.text();
    testLogger.log('Cookie auth error:', errorText);
  }

  testLogger.log('Authentication flow test completed');
});
