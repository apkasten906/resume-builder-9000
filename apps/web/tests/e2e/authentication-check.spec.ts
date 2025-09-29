import { test } from './test-setup';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

/**
 * Test specifically focused on the authentication flow
 */
test('Authentication flow check', async ({ page, request }) => {
  console.log('Starting authentication flow test');

  // Step 1: Try direct API login
  console.log('Testing direct API login...');
  const loginResponse = await request.post(`${API_BASE}/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: 'user@example.com',
      password: 'ValidPassword1!',
    },
  });

  console.log(`API Login status: ${loginResponse.status()}`);
  if (loginResponse.ok()) {
    const data = await loginResponse.json();
    console.log('Login response:', data);
    console.log('Token received:', !!data.token);
  } else {
    const errorText = await loginResponse.text();
    console.log('Login error response:', errorText);
  }

  // Step 2: Check UI login flow
  console.log('Testing UI login flow...');
  await page.goto(`${WEB_BASE}/login`);
  await page.waitForLoadState('networkidle');

  // Check if login form is present
  const emailFieldVisible = await page.getByLabel('Email').isVisible();
  const passwordFieldVisible = await page.getByLabel('Password').isVisible();

  console.log(
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
    console.log(`After login, current URL: ${currentUrl}`);
    const loginSuccessful = !currentUrl.includes('/login');
    console.log(`Login appears successful: ${loginSuccessful}`);

    // Check cookies after login
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    console.log('Session cookie present after login:', !!sessionCookie);

    if (sessionCookie) {
      console.log('Session cookie details:');
      console.log(`- Domain: ${sessionCookie.domain}`);
      console.log(`- Path: ${sessionCookie.path}`);
      console.log(`- Expires: ${new Date(sessionCookie.expires * 1000).toISOString()}`);
      console.log(`- HttpOnly: ${sessionCookie.httpOnly}`);
      console.log(`- Secure: ${sessionCookie.secure}`);
      console.log(`- SameSite: ${sessionCookie.sameSite}`);

      // Try a simple API call with this cookie
      console.log('Testing API call with session cookie...');
      const userResponse = await request.get(`${API_BASE}/auth/me`, {
        headers: { Cookie: `session=${sessionCookie.value}` },
      });

      console.log(`/auth/me status: ${userResponse.status()}`);
      if (userResponse.ok()) {
        const userData = await userResponse.json();
        console.log('User data:', userData);
      } else {
        const errorText = await userResponse.text();
        console.log('/auth/me error:', errorText);
      }
    }
  }

  // Step 3: Check if hardcoded token works
  console.log('Testing hardcoded token...');

  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTkwODUyNzcsImV4cCI6MTc1OTY5MDA3N30.CX1f-7D9mZg1nGrvyQkKgCTB1lQn8mVT_tTA-jfWtZQ';

  const tokenResponse = await request.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${testToken}` },
  });

  console.log(`/auth/me with bearer token status: ${tokenResponse.status()}`);
  if (tokenResponse.ok()) {
    const tokenData = await tokenResponse.json();
    console.log('Token auth data:', tokenData);
  } else {
    const errorText = await tokenResponse.text();
    console.log('Token auth error:', errorText);
  }

  // Also try as cookie
  const cookieResponse = await request.get(`${API_BASE}/auth/me`, {
    headers: { Cookie: `session=${testToken}` },
  });

  console.log(`/auth/me with cookie token status: ${cookieResponse.status()}`);
  if (cookieResponse.ok()) {
    const cookieData = await cookieResponse.json();
    console.log('Cookie auth data:', cookieData);
  } else {
    const errorText = await cookieResponse.text();
    console.log('Cookie auth error:', errorText);
  }

  console.log('Authentication flow test completed');
});
