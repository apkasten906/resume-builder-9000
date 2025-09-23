import { test, expect } from '@playwright/test';
const WEB_BASE = process.env['WEB_BASE'] || 'http://localhost:3000';

test('Applications add and list', async ({ page }) => {
  await page.goto(`${WEB_BASE}/applications`);
  await page.getByLabel('Company').fill('Acme');
  await page.getByLabel('Role').fill('Engineer');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('text=Acme')).toBeVisible();
});
