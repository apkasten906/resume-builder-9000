import { test, expect } from '@playwright/test';
import { dbCleanup } from './db-cleanup.template';
import type { Page, APIRequestContext } from '@playwright/test';
import { testLogger } from './utils/test-logger';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

// Store authToken for cleanup
let currentAuthToken: string;

/**
 * This test adds applications and verifies they appear in the list.
 */
testWithAuth(
  'Applications add and list',
  async ({
    page,
    request,
    authToken,
  }: {
    page: Page;
    request: APIRequestContext;
    authToken: string;
  }) => {
    // Store authToken for cleanup
    currentAuthToken = authToken;

    testLogger.info(
      'applications-add-test',
      'Starting applications add and list test with API auth'
    );

    // Store the token in localStorage as well for the application to find
    await page.evaluate((token: string) => {
      localStorage.setItem('authToken', token);
    }, authToken);

    // Step 1: Create a test application via API using Bearer auth token
    const initialAppName = `API Test Company ${Date.now().toString().slice(-6)}`;
    const initialAppRole = `API Test Role ${Date.now().toString().slice(-4)}`;

    testLogger.log(`Creating initial test application via API: ${initialAppName}`);

    try {
      // Use the API to create an application (properly using auth token)
      const createResponse = await request.post(`${API_BASE}/applications`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          company: initialAppName,
          role: initialAppRole,
        },
      });

      if (!createResponse.ok()) {
        const errorText = await createResponse.text();
        testLogger.error('Failed to create application:', errorText);
        throw new Error(`Application creation failed with status ${createResponse.status()}`);
      }

      const createdApp = await createResponse.json();
      testLogger.log('Successfully created application:', createdApp);
    } catch (err) {
      testLogger.error('Error creating test application via API:', err);
      throw err;
    }

    // Step 2: Navigate to applications page and verify the test app is there
    await page.goto(`${WEB_BASE}/applications`);
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({ path: `./test-results/applications-before-add.png` });

    // Check if our API-created application is visible in the UI
    testLogger.log('Checking if API-created application is visible in UI');
    await page.waitForTimeout(1000); // Give the page a moment to render

    // Log all table content for debugging
    const tableContent = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return cells.map(cell => cell.textContent?.trim());
      });
    });
    testLogger.log('Current table content:', tableContent);

    try {
      // Check if our application is visible
      await expect(page.locator('table').getByText(initialAppName, { exact: false })).toBeVisible({
        timeout: 5000,
      });

      testLogger.log('Success! API-created application is visible in the UI');
    } catch (error) {
      testLogger.error('API-created application not found in UI');

      // Check API directly to see if the application was created
      const listResponse = await request.get(`${API_BASE}/applications`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const apiApps = await listResponse.json();
      testLogger.log('Current applications from API:', apiApps);
      throw error; // Re-throw so test still fails
    }

    // Step 3: Create a second application via the UI form
    const uiAppName = `UI Acme ${Date.now().toString().slice(-6)}`;
    const uiAppRole = `UI Engineer ${Date.now().toString().slice(-4)}`;
    testLogger.log(`Adding second application via UI: ${uiAppName}`);

    // Fill in the form
    await page.getByLabel('Company').fill(uiAppName);
    await page.getByLabel('Role').fill(uiAppRole);

    // Click the Add button
    await page.getByRole('button', { name: 'Add' }).click();

    // Step 4: Verify the UI-created application appears
    // Give a moment for the operation to complete
    await page.waitForTimeout(2000);

    // Reload the page to ensure fresh data
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take screenshot after adding both applications
    await page.screenshot({ path: `./test-results/applications-list-after-add.png` });

    try {
      // Assert the UI-created application is now visible
      await expect(page.locator('table').getByText(uiAppName, { exact: false })).toBeVisible({
        timeout: 5000,
      });

      testLogger.log('Success! UI-created application is also visible');
    } catch (error) {
      testLogger.error('UI-created application not found. Final table content:');
      const finalTableContent = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr'));
        return rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return cells.map(cell => cell.textContent?.trim());
        });
      });
      testLogger.log(finalTableContent);
      throw error;
    }

    testLogger.log('Test complete - both API and UI applications are visible!');

    // Cleanup: Remove test applications from the database
    try {
      await dbCleanup({
        tables: ['applications'],
        testContext: { authToken, testId: 'applications-add-test' },
      });
      testLogger.log('Test data cleaned up using dbCleanup.');
    } catch (cleanupError) {
      testLogger.error('Error cleaning up test data using dbCleanup:', cleanupError);
    }
  }
);

test.beforeAll(async () => {
  // TODO: Implement beforeAll logic
});

test.afterAll(async () => {
  // TODO: Implement afterAll logic
});

test.beforeEach(async () => {
  // TODO: Implement beforeEach logic
});

test.afterEach(async () => {
  try {
    await dbCleanup({
      tables: ['applications'],
      testContext: { authToken: currentAuthToken, testId: 'applications-add-test' },
    });
    testLogger.info('applications-add-test', 'Test data cleaned up after each test.');
  } catch (cleanupError) {
    testLogger.error(
      'applications-add-test',
      'Error during afterEach cleanup:',
      String(cleanupError)
    );
  }
});


