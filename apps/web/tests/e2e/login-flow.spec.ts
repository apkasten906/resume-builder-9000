import { test, expect } from './test-setup';

const WEB_BASE = process.env['WEB_BASE'] || 'http://localhost:3000';

test.describe('Login flow', () => {
  test('signs in with demo credentials', async ({ page }) => {
    await page.goto(`${WEB_BASE}/login`);
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(`${WEB_BASE}/applications`);
    await expect(page.locator('h3')).toHaveText(/Applications/i);
  });
});
