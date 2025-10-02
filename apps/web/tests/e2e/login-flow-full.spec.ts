import { test, expect } from './test-setup';

const WEB_BASE = process.env['WEB_BASE'] || 'http://localhost:3000';

test.describe('Login flow', () => {
  test('Get Started button navigates to Sign In page', async ({ page }) => {
    // Clear auth to simulate unauthenticated user
    await page.context().clearCookies();
    await page.goto(WEB_BASE);
    await page.getByRole('button', { name: /Get Started/i }).click();
    await expect(page).toHaveURL(`${WEB_BASE}/login`);
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Register/i })).toBeVisible();
  });

  test('shows error and does not navigate on failed login, then succeeds on correct credentials', async ({
    page,
  }) => {
    await page.goto(`${WEB_BASE}/login`);
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(`${WEB_BASE}/login`);

    // Now correct the password and login
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(`${WEB_BASE}/`);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resume Upload' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Applications' })).toBeVisible();
  });
});
