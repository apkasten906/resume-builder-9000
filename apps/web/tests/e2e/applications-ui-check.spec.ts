import { test } from './test-setup';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Minimal test that focuses only on UI interactions without expecting backend functionality
 * This helps isolate whether the issue is with UI rendering or backend data flow
 */
test('Verify applications page UI components', async ({ page }) => {
  console.log('Starting minimal UI verification test');

  // Navigate to applications page
  await page.goto(`${WEB_BASE}/applications`);
  await page.waitForLoadState('networkidle');
  console.log(`Navigated to ${page.url()}`);

  // Take screenshot of initial state
  await page.screenshot({ path: './test-results/applications-ui-initial.png' });

  // Check that essential UI components are present
  const pageTitle = await page
    .locator('h1, h2, h3')
    .filter({ hasText: /applications/i })
    .isVisible();
  console.log(`Page title with "Applications" found: ${pageTitle}`);

  // Check for the form inputs
  const companyInput = await page.getByLabel('Company').isVisible();
  const roleInput = await page.getByLabel('Role').isVisible();
  const addButton = await page.getByRole('button', { name: 'Add' }).isVisible();

  console.log('Form elements present:');
  console.log(`- Company input: ${companyInput}`);
  console.log(`- Role input: ${roleInput}`);
  console.log(`- Add button: ${addButton}`);

  // Check for table or list structure
  const tableExists = await page.locator('table').isVisible();
  console.log(`Table element exists: ${tableExists}`);

  if (tableExists) {
    // Count table rows (should at least have a header row)
    const rowCount = await page.locator('table tr').count();
    console.log(`Table has ${rowCount} rows`);
  } else {
    // Check if there's any alternative list structure
    const listItems = await page.locator('ul li, ol li').count();
    console.log(`List items found: ${listItems}`);
  }

  // Try filling out the form (without expecting it to work)
  const testCompany = `Test Company ${Date.now().toString().slice(-6)}`;
  const testRole = `Test Role ${Date.now().toString().slice(-6)}`;

  await page.getByLabel('Company').fill(testCompany);
  await page.getByLabel('Role').fill(testRole);

  // Take screenshot after form fill
  await page.screenshot({ path: './test-results/applications-ui-form-filled.png' });
  console.log('Form filled with test data');

  // Click the button but don't assert on results
  // This helps us see if the form submission causes any visual changes or errors
  try {
    await page.getByRole('button', { name: 'Add' }).click();
    console.log('Add button clicked successfully');
    await page.waitForTimeout(1000); // Brief wait to capture any immediate UI changes
    await page.screenshot({ path: './test-results/applications-ui-after-click.png' });
  } catch (error: unknown) {
    console.log('Error clicking button:', error instanceof Error ? error.message : String(error));
  }

  // Validate the page is still in a usable state
  const stillHasForm = await page.getByLabel('Company').isVisible();
  console.log(`Form still visible after submission: ${stillHasForm}`);

  console.log('UI verification test completed');
});
