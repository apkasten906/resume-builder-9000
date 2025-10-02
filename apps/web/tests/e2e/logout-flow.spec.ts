import { test, expect } from '@playwright/test';

test('logout clears cookie and stays logged out after reload', async ({ page, context }) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Simulate a login via the real Next login route (or drive the login form)
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('ValidPassword1!');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Expect signed-in home (e.g., welcome back)
  await page.waitForURL(baseUrl + '/');
  await expect(page.getByText(/Welcome back/i)).toBeVisible();

  // Click Log Out in the AppShell
  await page.getByRole('button', { name: /log out/i }).click();

  // Should show Get Started now
  await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();

  // Reload and ensure still logged out (cookie really gone)
  await page.reload();
  await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();

  // Optional: ensure no 'session' cookie
  const cookies = await context.cookies();
  expect(cookies.find(c => c.name === 'session')).toBeFalsy();
});
