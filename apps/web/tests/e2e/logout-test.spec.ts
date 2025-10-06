import { test, expect, Page } from '@playwright/test';

test('Logout functionality works correctly', async ({ page }: { page: Page }) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // 1. Go to login page and login
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('ValidPassword1!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 2. Wait for redirect to applications page (confirms login worked)
  await page.waitForURL(/\/applications/, { timeout: 5000 });

  // 3. Navigate to home page
  await page.goto(baseUrl);

  // 4. Verify we're logged in (should see the authenticated view)
  await expect(page.getByText('Welcome back')).toBeVisible();

  // 5. Check cookies before logout
  const cookiesBeforeLogout = await page.context().cookies();
  console.log('Cookies before logout:', cookiesBeforeLogout);

  // Click logout button
  await page.getByRole('button', { name: /log out/i }).click();

  // 6. Wait a moment for logout to process and check cookies after
  await page.waitForTimeout(1000);
  const cookiesAfterLogout = await page.context().cookies();
  console.log('Cookies after logout:', cookiesAfterLogout);
  await page.waitForTimeout(1000);

  // 7. Verify we're shown the unauthenticated "Get Started" view
  // First, let's debug what's actually on the page
  await page.waitForTimeout(2000); // Give time for state to settle
  const pageContent = await page.textContent('body');
  console.log('Page content after logout:', pageContent?.substring(0, 500));

  // Check if we can find the welcome message
  const welcomeMessage = page.getByText('Welcome to Resume Builder 9000');
  const isWelcomeVisible = await welcomeMessage.isVisible().catch(() => false);
  console.log('Welcome message visible:', isWelcomeVisible);

  if (isWelcomeVisible) {
    await expect(welcomeMessage).toBeVisible();
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
  } else {
    // If welcome message not found, check if user is still authenticated
    const welcomeBack = page.getByText(/Welcome back/);
    const isWelcomeBackVisible = await welcomeBack.isVisible().catch(() => false);
    console.log('Welcome back message visible:', isWelcomeBackVisible);

    if (isWelcomeBackVisible) {
      throw new Error('Logout failed: User is still authenticated and seeing logged-in content');
    } else {
      throw new Error('Page state unclear: Neither welcome nor welcome back message found');
    }
  }

  // 8. Verify we don't see the authenticated content anymore
  await expect(page.getByText('Welcome back')).not.toBeVisible();

  // 9. Try to access a protected page - should be denied
  await page.goto(`${baseUrl}/applications`);
  await expect(
    page
      .getByRole('heading', { name: /unauthorized/i })
      .or(page.getByText('Error 401: Unauthorized'))
      .first()
  ).toBeVisible();
});
