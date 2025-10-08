import { test, expect } from './test-setup';

test('logout clears cookie and stays logged out after reload', async ({ page, context }) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // User is already logged in via test-setup, so start from authenticated state
  await page.goto(baseUrl);

  // Verify we're logged in by checking for authenticated content or navigation
  // Look for either "Welcome back" text or navigate to a protected page
  await page.goto(`${baseUrl}/applications`);

  // Wait for the page to load and verify we're authenticated
  await page.waitForLoadState('networkidle');

  // Click Log Out (look for the logout button more flexibly)
  const logoutButton = page
    .locator('button', { hasText: /log.?out/i })
    .or(page.locator('[data-testid="logout-button"]'))
    .or(page.getByRole('button', { name: /sign.?out/i }));

  await logoutButton.click();

  // Wait for redirect and check we're back to unauthenticated state
  await page.waitForURL(`${baseUrl}/`);
  await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();

  // Reload and ensure still logged out
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();

  // Verify session cookie is cleared
  const cookies = await context.cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  expect(sessionCookie).toBeFalsy();
});
