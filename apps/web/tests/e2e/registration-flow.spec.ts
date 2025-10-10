import { test, expect } from './test-setup';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

test.describe('User registration flow', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.request.post(`${WEB_BASE}/api/auth/logout`);
    } catch {
      // Ignore logout failures; the cookie clearing below guarantees an anonymous state
    }
    await page.context().clearCookies();
  });

  test('completes the multi-step registration process', async ({ page }) => {
    const uniqueEmail = `playwright-${Date.now()}@example.com`;

    await page.goto(`${WEB_BASE}/register`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('Password', { exact: true }).fill('ValidPassword1!');
    await page.getByLabel('Confirm Password').fill('ValidPassword1!');
    await expect(page.getByText('Password must include:')).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('Full Name').fill('Playwright User');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('**/');
    const escapedBase = WEB_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page).toHaveURL(new RegExp(`${escapedBase}/?$`));
    await expect(page.getByText(/Welcome/i).first()).toBeVisible();
  });

  test('surfaces validation errors for weak passwords and duplicate emails', async ({ page }) => {
    await page.goto(`${WEB_BASE}/register`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText(/Password must meet all requirements/i)).toBeVisible();

    await page.getByLabel('Password', { exact: true }).fill('ValidPassword1!');
    await page.getByLabel('Confirm Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('Full Name').fill('Existing User');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText(/Email already registered/i)).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveAttribute('value', 'user@example.com');
  });
});

