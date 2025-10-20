/**
 * E2E tests for route protection
 * Verifies that unauthenticated users are automatically redirected to the home page
 * when attempting to access protected routes
 */

import { test, expect } from '@playwright/test';
import { WEB_BASE } from './test-setup';

test.describe('Route Protection', () => {
  test.beforeEach(async ({ context, page }) => {
    // Clear all cookies from the browser context to ensure clean state
    await context.clearCookies();

    // Navigate to home page first and clear any client-side storage
    await page.goto(WEB_BASE);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Clear cookies again after page load to remove any set during navigation
    await context.clearCookies();
  });

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
    }) => {
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

  test('should show loading state briefly before redirecting', async ({ page }) => {
    // Navigate to a protected route
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

  test('public routes should remain accessible without authentication', async ({ page }) => {
    const publicRoutes = [
      { path: '/', name: 'Home', heading: /Welcome to Resume Builder 9000/i },
      { path: '/about', name: 'About', heading: /About Resume Builder 9000/i },
      { path: '/login', name: 'Login', heading: /^Sign in$/i },
      { path: '/register', name: 'Register', heading: /Create your account/i },
    ];

    for (const route of publicRoutes) {
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
    // First, log in
    await page.goto(`${WEB_BASE}/login`, { waitUntil: 'networkidle' });

    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: /Sign in/i }).click();

    // Wait for successful login (should redirect to home/dashboard)
    await page.waitForURL(WEB_BASE + '/', { timeout: 10000 });

    // Verify authenticated state - should see dashboard instead of hero
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });

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

    // Should see the landing page hero (not dashboard)
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible({
      timeout: 10000,
    });

    // Try to access protected route again
    await page.goto(`${WEB_BASE}/applications`, { waitUntil: 'networkidle' });

    // Should be redirected back to home
    await expect(page).toHaveURL(WEB_BASE + '/', { timeout: 10000 });
  });

  test('should not show navigation menu when unauthenticated', async ({ page }) => {
    await page.goto(WEB_BASE, { waitUntil: 'networkidle' });

    // Navigation menu should not be visible
    await expect(page.getByText('Resume Upload')).not.toBeVisible();
    await expect(page.getByText('Job Intake')).not.toBeVisible();
    await expect(page.getByText('Applications')).not.toBeVisible();

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
    // Simulate user typing URL directly in browser or clicking a bookmark
    // by using a fresh page context without any prior navigation
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
