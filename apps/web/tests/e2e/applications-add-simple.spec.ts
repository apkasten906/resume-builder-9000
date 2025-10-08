import { test, expect, Page } from '@playwright/test';
import { testLogger } from './utils/test-logger';
import { AuthHelper } from './utils/auth-helper';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * This test adds an application via the UI and verifies it appears in the list
 */
test('Applications add and list', async ({ page }: { page: Page }) => {
  // Set up authentication using API login
  await AuthHelper.setupAuth(page);
  testLogger.log('Auth setup complete using API login');

  // Now navigate to applications page to verify login and access
  testLogger.log('Navigating to applications page');
  await page.goto(`${WEB_BASE}/applications`);
  await page.waitForLoadState('networkidle');

  // Take screenshot of initial state for debugging
  await page.screenshot({ path: `./test-results/applications-before-add.png` });
  testLogger.log('Initial page loaded successfully');

  // Generate unique application names for this test run
  const timestamp = Date.now().toString().slice(-6);
  const uiAppName = `Test Company ${timestamp}`;
  const uiAppRole = `Test Role ${timestamp}`;
  testLogger.log(`Adding new application via UI: ${uiAppName} - ${uiAppRole}`);

  // Fill in the application form
  await page.getByLabel('Company').fill(uiAppName);
  await page.getByLabel('Role').fill(uiAppRole);

  // Click the Add button

  // Click Add and wait for possible navigation
  await Promise.all([
    page.getByRole('button', { name: 'Add' }).click(),
    page.waitForLoadState('networkidle'),
  ]);

  // Debug: Capture page state after Add
  await testLogger.debugPageState(page, 'after Add');

  // Verify auth is still valid and check for redirect to login or page closure
  let finalUrl: string;
  try {
    finalUrl = page.url();
    testLogger.log('Final URL after Add:', finalUrl);

    // Verify auth token is still present
    const authStillValid = await AuthHelper.verifyAuth(page);
    testLogger.log('Auth token still present after Add:', authStillValid);

    const pageContent = await page.content();
    testLogger.log('Page content after Add:', pageContent.substring(0, 1000));
  } catch (err) {
    testLogger.log(
      'Error accessing page after Add:',
      err instanceof Error ? err.message : String(err)
    );
    throw new Error(
      'Page was closed or redirected after Add. Possible session loss or navigation issue.'
    );
  }

  // If redirected to login, fail the test with a clear message
  if (finalUrl.includes('/login')) {
    testLogger.log('Redirected to login after Add. Session may have been lost.');
    throw new Error('Redirected to login after Add. Session may have been lost.');
  }

  // Debug: Print toast and response status
  const toast = page.locator('div').filter({ hasText: 'Application added' }).first();
  testLogger.log('Toast locator count:', await toast.count());
  testLogger.log('Toast visible:', await toast.isVisible().catch(() => false));

  // Wait for success notification
  try {
    const toast = page.locator('div').filter({ hasText: 'Application added' }).first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    testLogger.log('Success notification appeared');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    testLogger.log(`Toast notification not found: ${message}, but continuing test`);
  }

  // Wait for the application to be processed
  await page.waitForTimeout(1000);

  // Debug: Print table HTML after add (no reload needed - app already reloaded the list)
  await page.waitForTimeout(1000); // Allow UI to update after successful add
  const tableHtml = await page
    .locator('table')
    .innerHTML()
    .catch(() => 'No table found');
  testLogger.log('Table HTML after add:', tableHtml.substring(0, 500));

  // Take screenshot after adding application
  await page.screenshot({ path: `./test-results/applications-list-after-add.png` });

  // Log table content for debugging
  const tableContent = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells.map(cell => cell.textContent?.trim());
    });
  });
  testLogger.log('Table content:', tableContent);

  // Check if our application is visible
  try {
    await expect(page.locator('table').getByText(uiAppName, { exact: false })).toBeVisible({
      timeout: 5000,
    });
    testLogger.log('Success! Application is visible in the UI');
  } catch (error) {
    testLogger.log('Application not found in UI. Here is the page content:');
    const content = await page.content();
    testLogger.log(content.substring(0, 1000) + '...');
    throw error;
  }

  testLogger.log('Test completed successfully');

  // Cleanup: Clear authentication
  await AuthHelper.clearAuth(page);
});
