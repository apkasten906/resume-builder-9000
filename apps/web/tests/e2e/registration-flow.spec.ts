import { test, expect } from './test-setup';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const TEST_SECRET = process.env.TEST_ROUTE_SECRET || '';

type OutboxEntry = { to: string; metadata?: { token?: string; type?: string } };

async function waitForVerificationToken(email: string): Promise<string> {
  const timeoutAt = Date.now() + 10000;
  while (Date.now() < timeoutAt) {
    try {
      // Use test-support endpoint to get emails from in-memory outbox
      const response = await fetch(`${API_BASE}/__test/emails`, {
        headers: { 'x-test-secret': TEST_SECRET },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.status}`);
      }
      const emails = (await response.json()) as OutboxEntry[];
      const match = [...emails]
        .reverse()
        .find(message => message.to === email && message.metadata?.type === 'email-verification');
      const token = match?.metadata?.token;
      if (typeof token === 'string' && token.length > 0) {
        return token;
      }
    } catch (err) {
      // Endpoint may not be ready yet, retry shortly
      console.error('Error fetching emails:', err);
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

    // Clear email outbox using test-support endpoint
    try {
      await page.request.post(`${API_BASE}/__test/clear-emails`, {
        headers: { 'x-test-secret': TEST_SECRET },
      });
    } catch (err) {
      console.warn('Failed to clear email outbox:', err);
    }

    // Seed the duplicate user for the duplicate email test by calling the backend API directly.
    // Use JSON POST so the backend receives the expected content-type.
    try {
      await page.request.post(`${API_BASE}/auth/register`, {
        data: JSON.stringify({
          email: 'user@example.com',
          password: 'ValidPassword1!',
          confirmPassword: 'ValidPassword1!',
          fullName: 'Existing User',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // If seeding fails, continue — the test will exercise the registration flow and surface errors.
      // We don't want seeding failures to block the rest of the beforeEach cleanup.
      // Playwright's request api will throw on non-2xx statuses; swallow here to let tests run and fail with actionable output.
    }
    // Optionally, confirm the email for this user if your flow requires it
    // You can add logic here to read the outbox and confirm the user if needed
  });

  test('completes the multi-step registration process', async ({ page }) => {
    const uniqueEmail = `playwright-${Date.now()}@example.com`;

    await page.goto(`${WEB_BASE}/register`, { waitUntil: 'networkidle' });

    // Wait for the registration form to be fully loaded and interactive
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });

    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByRole('button', { name: 'Continue' }).click();

    // Wait for step 2 (security/password) to render
    await page.waitForSelector('input[name="password"]', { state: 'visible', timeout: 10000 });
    await page.getByLabel('Password', { exact: true }).fill('ValidPassword1!');
    await page.getByLabel('Confirm Password').fill('ValidPassword1!');
    await expect(page.getByText('Password must include:')).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Wait for step 3 (profile/full name) to render
    await page.waitForSelector('input[name="fullName"]', { state: 'visible', timeout: 10000 });
    await page.getByLabel('Full Name').fill('Playwright User');

    // Submit via the client so the UI shows the "Check your email" screen
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    // Confirm that the outbox contains the verification email and obtain token
    const token = await waitForVerificationToken(uniqueEmail);

    await page.goto(`${WEB_BASE}/confirm-email?token=${token}`, { waitUntil: 'networkidle' });
    await expect(page.getByText(/We confirmed/i)).toBeVisible({ timeout: 10000 });
    // Click the confirm-email return link. Prefer a stable test id if present.
    const goLoginByTestId = page.locator('[data-testid="confirm-email-go-login"]');
    if (await goLoginByTestId.count()) {
      await goLoginByTestId.first().click();
    } else {
      await page.getByRole('link', { name: 'Go To Login' }).click();
    }

    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/');
    const escapedBase = WEB_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page).toHaveURL(new RegExp(`${escapedBase}/?$`));
  });

  test('surfaces validation errors for weak passwords and duplicate emails', async ({ page }) => {
    await page.goto(`${WEB_BASE}/register`, { waitUntil: 'networkidle' });

    // Wait for the registration form to be fully loaded and interactive
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Wait for step 2 (security/password) to render
    await page.waitForSelector('input[name="password"]', { state: 'visible', timeout: 10000 });
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm Password').fill('short');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText(/Password must meet all requirements/i)).toBeVisible();

    await page.getByLabel('Password', { exact: true }).fill('ValidPassword1!');
    await page.getByLabel('Confirm Password').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('Full Name').fill('Existing User');

    // Submit via the client so the UI surfaces validation errors for duplicate emails
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText(/Email already registered/i)).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveAttribute('value', 'user@example.com');
  });
});
