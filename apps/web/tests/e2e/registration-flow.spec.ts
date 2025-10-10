import { test, expect } from './test-setup';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFile, rm } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');
const EMAIL_OUTBOX_PATH = path.join(repoRoot, 'packages/api/.tmp/email-outbox.json');

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

type OutboxEntry = { to: string; metadata?: { token?: string; type?: string } };

async function waitForVerificationToken(email: string): Promise<string> {
  const timeoutAt = Date.now() + 5000;
  while (Date.now() < timeoutAt) {
    try {
      const raw = await readFile(EMAIL_OUTBOX_PATH, 'utf-8');
      const emails = JSON.parse(raw) as OutboxEntry[];
      const match = [...emails]
        .reverse()
        .find(message => message.to === email && message.metadata?.type === 'email-verification');
      const token = match?.metadata?.token;
      if (typeof token === 'string' && token.length > 0) {
        return token;
      }
    } catch {
      // File may not exist yet, retry shortly
    }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for verification token for ${email}`);
}

test.describe('User registration flow', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.request.post(`${WEB_BASE}/api/auth/logout`);
    } catch {
      // Ignore logout failures; the cookie clearing below guarantees an anonymous state
    }
    await page.context().clearCookies();
    await rm(EMAIL_OUTBOX_PATH, { force: true });
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

    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    const token = await waitForVerificationToken(uniqueEmail);

    await page.goto(`${WEB_BASE}/confirm-email?token=${token}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/We confirmed/i)).toBeVisible();
    await page.getByRole('link', { name: 'Go to login' }).click();

    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/');
    const escapedBase = WEB_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page).toHaveURL(new RegExp(`${escapedBase}/?$`));
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

