import { test, expect } from '@playwright/test';

test('Home page unauthenticated shows Get Started', async ({ page }) => {
  await page.context().clearCookies();
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  await page.goto(baseUrl);
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Resume Builder 9000')).toBeVisible();
  await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
});
