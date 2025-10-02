import { test } from './test-setup';
import type { Page } from '@playwright/test';
import { testLogger } from './utils/test-logger';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Minimal test that focuses only on UI interactions without expecting backend functionality
 * This helps isolate whether the issue is with UI rendering or backend data flow
 */
test('Verify applications page UI components', async ({ page }: { page: Page }) => {
  testLogger.log('Starting minimal UI verification test');

  // Navigate to applications page
  await page.goto(`${WEB_BASE}/applications`);
  await page.waitForLoadState('networkidle');
  testLogger.log(`Navigated to ${page.url()}`);

  // Take screenshot of initial state
  await page.screenshot({ path: './test-results/applications-ui-initial.png' });

  // Check that essential UI components are present
  const pageTitle = await page
    .locator('h1, h2, h3')
    .filter({ hasText: /applications/i })
    .isVisible();
  testLogger.log(`Page title with "Applications" found: ${pageTitle}`);

  // Check for the form inputs
  const companyInput = await page.getByLabel('Company').isVisible();
  const roleInput = await page.getByLabel('Role').isVisible();
  const addButton = await page.getByRole('button', { name: 'Add' }).isVisible();

  testLogger.log('Form elements present:');
  testLogger.log(`- Company input: ${companyInput}`);
  testLogger.log(`- Role input: ${roleInput}`);
  testLogger.log(`- Add button: ${addButton}`);

  // Check for table or list structure
  const tableExists = await page.locator('table').isVisible();
  testLogger.log(`Table element exists: ${tableExists}`);

  if (tableExists) {
    // Count table rows (should at least have a header row)
    const rowCount = await page.locator('table tr').count();
    testLogger.log(`Table has ${rowCount} rows`);
  } else {
    // Check if there's any alternative list structure
    const listItems = await page.locator('ul li, ol li').count();
    testLogger.log(`List items found: ${listItems}`);
  }

  // Try filling out the form (without expecting it to work)
  const testCompany = `Test Company ${Date.now().toString().slice(-6)}`;
  const testRole = `Test Role ${Date.now().toString().slice(-6)}`;

  await page.getByLabel('Company').fill(testCompany);
  await page.getByLabel('Role').fill(testRole);

  // Take screenshot after form fill
  await page.screenshot({ path: './test-results/applications-ui-form-filled.png' });
  testLogger.log('Form filled with test data');

  // Click the button but don't assert on results
  // This helps us see if the form submission causes any visual changes or errors
  try {
    await page.getByRole('button', { name: 'Add' }).click();
    testLogger.log('Add button clicked successfully');
    await page.waitForTimeout(1000); // Brief wait to capture any immediate UI changes
    await page.screenshot({ path: './test-results/applications-ui-after-click.png' });
  } catch (error: unknown) {
    testLogger.log(
      'Error clicking button:',
      error instanceof Error ? error.message : String(error)
    );
  }

  // Validate the page is still in a usable state
  const stillHasForm = await page.getByLabel('Company').isVisible();
  testLogger.log(`Form still visible after submission: ${stillHasForm}`);

  testLogger.log('UI verification test completed');
});
