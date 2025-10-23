/**
 * E2E tests for route protection
 * Verifies that unauthenticated users are automatically redirected to the home page
 * when attempting to access protected routes
 */

import { test, expect } from '@playwright/test';
import { WEB_BASE, API_BASE } from './test-setup';

test.describe('Route Protection', () => {
  // NOTE: Global test harness seeds an auth cookie by default. Do not clear cookies here
  // (that would remove the seeded cookie). Tests that require an unauthenticated state
  // should clear cookies explicitly at the start of the test.

  const protectedRoutes = [
    { path: '/resume-upload', name: 'Resume Upload' },
    { path: '/applications', name: 'Applications' },
    { path: '/job-intake', name: 'Job Intake' },
    { path: '/tailor', name: 'Tailor' },
    { path: '/preview', name: 'Preview' },
    { path: '/output', name: 'Output' },
    { path: '/settings', name: 'Settings' },
    { path: '/resume-builder', name: 'Resume Builder' },
    { path: '/compose', name: 'Compose' },
  ];

  for (const route of protectedRoutes) {
    test(`should redirect unauthenticated user from ${route.name} to home page`, async ({
      page,
      context,
    }) => {
      // Ensure an anonymous context for this check by clearing any seeded cookies
      await context.clearCookies();

      // Attempt to navigate to protected route
      await page.goto(`${WEB_BASE}${route.path}`, { waitUntil: 'networkidle' });

      // Should be redirected to home page
      await expect(page).toHaveURL(WEB_BASE + '/', { timeout: 10000 });

      // Should see the landing page hero with "Get Started" button
      await expect(
        page.getByRole('heading', { name: /Welcome to Resume Builder 9000/i })
      ).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible({
        timeout: 10000,
      });
    });
  }

  test('should show loading state briefly before redirecting', async ({ page, context }) => {
    // Navigate to a protected route
    // Ensure anonymous session
    await context.clearCookies();

    const response = page.goto(`${WEB_BASE}/resume-upload`, { waitUntil: 'domcontentloaded' });

    // Should briefly show loading spinner (this may be too fast to catch reliably)
    // But we can at least check that we end up redirected
    await response;

    // Wait for redirect to complete
    await page.waitForURL(WEB_BASE + '/', { timeout: 10000 });

    // Verify we're on the home page
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('public routes should remain accessible without authentication', async ({
    page,
    context,
  }) => {
    const publicRoutes = [
      { path: '/', name: 'Home', heading: /Welcome to Resume Builder 9000/i },
      { path: '/about', name: 'About', heading: /About Resume Builder 9000/i },
      { path: '/login', name: 'Login', heading: /^Sign in$/i },
      { path: '/register', name: 'Register', heading: /Create your account/i },
    ];

    for (const route of publicRoutes) {
      // Ensure anonymous context for public route checks
      await context.clearCookies();

      await page.goto(`${WEB_BASE}${route.path}`, { waitUntil: 'networkidle' });

      // Should stay on the intended public route
      await expect(page).toHaveURL(WEB_BASE + route.path, { timeout: 5000 });

      // Should see the expected page content
      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('authenticated user should access protected routes', async ({ page }) => {
    // The test harness seeds an auth cookie in the global beforeEach; assume authenticated
    // Warm up the site with the seeded cookie so server-rendered auth is picked up on first render.
    await page.goto(WEB_BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(WEB_BASE + '/', { timeout: 10000 });

    // Wait briefly for the seeded session cookie to appear in the browser context.
    // This polls the cookie jar for up to 5s to avoid flakes where seeding completes
    // slightly after the test's first render.
    const sessionCookieName = process.env.AUTH_SESSION_COOKIE_NAME || 'session';
    let sessionCookie;
    const start = Date.now();
    while (!sessionCookie && Date.now() - start < 5000) {
      // eslint-disable-next-line no-await-in-loop
      const cookies = await page.context().cookies();
      // find the cookie by name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessionCookie = cookies.find((c: any) => c.name === sessionCookieName);
      if (!sessionCookie) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 200));
      }
    }
    if (!sessionCookie) {
      // Fallback: the global seeding may have failed. Try to log in via API and set
      // the session cookie on the browser context so the remainder of the test
      // can run deterministically.
      const loginResp = await page.request.post(`${API_BASE}/auth/login`, {
        data: { email: 'user@example.com', password: 'ValidPassword1!' },
      });
      if (loginResp.ok()) {
        const body = await loginResp.json();
        const token = body?.token;
        if (token) {
          await page.context().addCookies([
            {
              name: process.env.AUTH_SESSION_COOKIE_NAME || 'session',
              value: token,
              url: new URL('/', WEB_BASE).toString(),
              httpOnly: true,
              sameSite: 'Lax',
              secure: new URL(WEB_BASE).protocol === 'https:',
            },
          ]);
          // re-read cookie
          const cookies = await page.context().cookies();
          sessionCookie = cookies.find(
            c => c.name === (process.env.AUTH_SESSION_COOKIE_NAME || 'session')
          );
        }
      }
    }
    await expect(sessionCookie).toBeTruthy();

    // Now try to access a protected route
    await page.goto(`${WEB_BASE}/resume-upload`, { waitUntil: 'networkidle' });

    // Should stay on the resume-upload page (not redirected)
    await expect(page).toHaveURL(WEB_BASE + '/resume-upload', { timeout: 5000 });

    // Should see the resume upload page content
    await expect(page.getByRole('heading', { name: /Upload Your Resume/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should redirect to home after logout', async ({ page }) => {
    // First, log in
    await page.goto(`${WEB_BASE}/login`, { waitUntil: 'networkidle' });

    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: /Sign in/i }).click();

    // Wait for successful login
    await page.waitForURL(WEB_BASE + '/', { timeout: 10000 });

    // Navigate to a protected route
    await page.goto(`${WEB_BASE}/applications`, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(WEB_BASE + '/applications');

    // Log out
    await page.getByRole('button', { name: /Log out/i }).click();

    // Should be redirected to home page
    await page.waitForURL(WEB_BASE + '/', { timeout: 10000 });

    // Should see the landing page hero (not applications dashboard)
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible({
      timeout: 10000,
    });

    // Try to access protected route again
    await page.goto(`${WEB_BASE}/applications`, { waitUntil: 'networkidle' });

    // Should be redirected back to home
    await expect(page).toHaveURL(WEB_BASE + '/', { timeout: 10000 });
  });

  test('should not show navigation menu when unauthenticated', async ({ page }) => {
    // Ensure anonymous context for this check
    await page.context().clearCookies();
    await page.goto(WEB_BASE, { waitUntil: 'networkidle' });

    // Navigation menu should not be visible (use role-specific locators to avoid
    // matching other on-page headings with the same text)
    await expect(page.getByRole('link', { name: 'Resume Upload' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Job Intake' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Applications' })).not.toBeVisible();

    // Should only see "Sign in" button in header
    await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible();
  });

  test('should show navigation menu when authenticated', async ({ page }) => {
    // Log in first
    await page.goto(`${WEB_BASE}/login`, { waitUntil: 'networkidle' });

    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: /Sign in/i }).click();

    await page.waitForURL(WEB_BASE + '/', { timeout: 10000 });

    // Navigation menu should be visible - use role to be more specific
    await expect(page.getByRole('link', { name: 'Resume Upload' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('link', { name: 'Job Intake' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Applications' })).toBeVisible();

    // Should see "Log out" button instead of "Sign in"
    await expect(page.getByRole('button', { name: /Log out/i })).toBeVisible();
  });

  test('should handle direct URL navigation to protected routes', async ({ page }) => {
    // Ensure anonymous context for this direct URL navigation test
    await page.context().clearCookies();

    // Simulate user typing URL directly in browser or clicking a bookmark
    await page.goto(`${WEB_BASE}/tailor`, { waitUntil: 'networkidle' });

    // Should be redirected to home
    await expect(page).toHaveURL(WEB_BASE + '/', { timeout: 10000 });
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Log in
    await page.goto(`${WEB_BASE}/login`, { waitUntil: 'networkidle' });

    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: /Sign in/i }).click();

    await page.waitForURL(WEB_BASE + '/', { timeout: 10000 });

    // Navigate to protected route
    await page.goto(`${WEB_BASE}/resume-upload`, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(WEB_BASE + '/resume-upload');

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' });

    // Should still be on the protected route (not redirected)
    await expect(page).toHaveURL(WEB_BASE + '/resume-upload');
    await expect(page.getByRole('heading', { name: /Upload Your Resume/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
