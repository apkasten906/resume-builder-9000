import { test, expect } from '@playwright/test';
import { testLogger } from './utils/test-logger';
import type { Page } from '@playwright/test';

// Import constants for URLs
const WEB_BASE: string = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * This test adds an application via the UI and verifies it appears in the list
 */
test('Applications add and list', async ({ page }: { page: Page }) => {
  const testContext = testLogger.child('Applications-Add-List');
  testContext.info('Starting applications add and list test - focusing on UI interactions');

  // First, navigate to applications page to verify login and access
  testContext.info('Navigating to applications page');
  await page.goto(`${WEB_BASE}/applications`);
  await page.waitForLoadState('networkidle');

  // Take screenshot of initial state for debugging
  await page.screenshot({ path: `./test-results/applications-before-add.png` });
  testContext.debug('Initial page loaded successfully');

  // Generate unique application names for this test run
  const timestamp: string = Date.now().toString().slice(-6);
  const uiAppName: string = `Test Company ${timestamp}`;
  const uiAppRole: string = `Test Role ${timestamp}`;
  testContext.info(`Adding new application via UI: ${uiAppName} - ${uiAppRole}`);

  // Fill in the application form
  await page.getByLabel('Company').fill(uiAppName);
  await page.getByLabel('Role').fill(uiAppRole);

  // Submit the form
  await page.getByRole('button', { name: 'Add Application' }).click();

  // Check for success notification (toast)
  try {
    const toast = page.locator('.toast, [role="alert"], .notification').first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    const toastMessage: string = (await toast.textContent()) || '';
    testContext.debug('Success notification appeared', { toastMessage });
  } catch (error) {
    const message: string = error instanceof Error ? error.message : 'Unknown error';
    testContext.warn(`Toast notification not found: ${message}, but continuing test`);
  }

  // Take screenshot after adding
  await page.screenshot({ path: `./test-results/applications-after-add.png` });

  // Wait a moment for the page to update
  await page.waitForTimeout(1000);

  // Refresh the page to make sure the application persisted
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Verify the application appears in the table
  const applicationTable = page.locator('[data-testid="applications-table"], table');

  // Check if the table exists and has content
  await expect(applicationTable).toBeVisible({ timeout: 10000 });

  const tableContent: string = (await applicationTable.textContent()) || '';
  testContext.debug('Table content:', { tableContent });

  // Look for our specific application in the table
  const companyCell = page.locator(`text="${uiAppName}"`);
  const roleCell = page.locator(`text="${uiAppRole}"`);

  await expect(companyCell).toBeVisible({ timeout: 5000 });
  await expect(roleCell).toBeVisible({ timeout: 5000 });

  testContext.info('✅ Application successfully added and verified in UI');

  // Take final screenshot
  await page.screenshot({ path: `./test-results/applications-final.png` });

  testContext.info('Test completed successfully');
});

// Note: Playwright test setup is handled by the test-setup.ts file


