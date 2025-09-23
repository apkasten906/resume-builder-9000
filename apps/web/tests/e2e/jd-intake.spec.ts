import { test, expect } from '@playwright/test';
const WEB_BASE = process.env['WEB_BASE'] || 'http://localhost:3000';

test('JD Intake parses text', async ({ page }) => {
  await page.goto(`${WEB_BASE}/job-intake`);
  await page
    .getByLabel('Paste JD')
    .fill(
      'Senior Fullstack Engineer at ExampleCorp\nExperience with TypeScript, React, Next.js and Node. 5 years experience.'
    );
  await page.getByRole('button', { name: 'Parse' }).click();
  await expect(page.locator('text=Parsed JD')).toBeVisible();
  await expect(page.locator('text=Senior Fullstack Engineer')).toBeVisible();
  await expect(page.locator('text=ExampleCorp')).toBeVisible();
});
