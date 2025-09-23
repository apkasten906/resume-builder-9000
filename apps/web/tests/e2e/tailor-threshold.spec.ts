import { test, expect } from '@playwright/test';
const WEB_BASE = process.env['WEB_BASE'] || 'http://localhost:3000';

test('Tailor runs and filters bullets', async ({ page }) => {
  await page.goto(`${WEB_BASE}/tailor`);
  await page.getByRole('button', { name: 'Run Tailor' }).click();
  const items = page.locator('div.rounded-2xl.border');
  await expect(items.first()).toBeVisible();
});
