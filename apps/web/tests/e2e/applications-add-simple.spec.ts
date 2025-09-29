import { test, expect } from './test-setup';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * This test adds an application via the UI and verifies it appears in the list
 */
test('Applications add and list', async ({ page }) => {
  console.log('Starting applications add and list test - focusing on UI interactions');

  // First, navigate to applications page to verify login and access
  console.log('Navigating to applications page');
  await page.goto(`${WEB_BASE}/applications`);
  await page.waitForLoadState('networkidle');

  // Take screenshot of initial state for debugging
  await page.screenshot({ path: `./test-results/applications-before-add.png` });
  console.log('Initial page loaded successfully');

  // Generate unique application names for this test run
  const timestamp = Date.now().toString().slice(-6);
  const uiAppName = `Test Company ${timestamp}`;
  const uiAppRole = `Test Role ${timestamp}`;
  console.log(`Adding new application via UI: ${uiAppName} - ${uiAppRole}`);

  // Fill in the application form
  await page.getByLabel('Company').fill(uiAppName);
  await page.getByLabel('Role').fill(uiAppRole);

  // Click the Add button
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for success notification
  try {
    const toast = page.locator('div').filter({ hasText: 'Application added' }).first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    console.log('Success notification appeared');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.log(`Toast notification not found: ${message}, but continuing test`);
  }

  // Wait for the application to be processed
  await page.waitForTimeout(1000);

  // Reload the page to ensure fresh data
  await page.reload();
  await page.waitForLoadState('networkidle');

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
  console.log('Table content:', tableContent);

  // Check if our application is visible
  try {
    await expect(page.locator('table').getByText(uiAppName, { exact: false })).toBeVisible({
      timeout: 5000,
    });
    console.log('Success! Application is visible in the UI');
  } catch (error) {
    console.log('Application not found in UI. Here is the page content:');
    const content = await page.content();
    console.log(content.substring(0, 1000) + '...');
    throw error;
  }

  console.log('Test completed successfully');
});
