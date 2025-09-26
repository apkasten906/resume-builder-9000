import { test as base, expect } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
base.beforeEach(async ({ page }) => {
  await page.goto(`${WEB_BASE}/login`);
  // Debug: take screenshot and log HTML before filling fields
  await page.screenshot({ path: '../../test-results/login-page-debug.png', fullPage: true });
  const html = await page.content();
  // eslint-disable-next-line no-console
  console.log('LOGIN PAGE HTML:', html);
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('ValidPassword1!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Debug: log cookies and response after login
  const cookies = await page.context().cookies();
  // eslint-disable-next-line no-console
  console.log('COOKIES AFTER LOGIN:', cookies);
  // Wait for navigation or log if it fails
  try {
    await page.waitForURL(/\/applications/, { timeout: 10000 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('DID NOT NAVIGATE TO /applications, URL is:', page.url());
    throw e;
  }
});

export const test = base;
export { expect };
