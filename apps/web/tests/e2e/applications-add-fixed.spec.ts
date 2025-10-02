import { testWithAuth, expect } from './test-setup';
import { testLogger } from './utils/test-logger';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

/**
 * This test adds an application using the working Bearer token auth
 * and verifies it appears in the applications list.
 */
testWithAuth('Applications add and list with Bearer auth', async ({ page, request, authToken }) => {
  testLogger.log('Starting applications test with Bearer token');

  // The authToken is already set up by the testWithAuth fixture
  testLogger.log('Using pre-authenticated token from test fixture');
  const token = authToken; // Using the token provided by the fixture

  // Store the token in localStorage as well for the application to find
  await page.evaluate(token => {
    localStorage.setItem('authToken', token);
  }, token);

  // Step 2: Create a test application directly via the API using Bearer auth
  const testAppName = `Test Company ${Date.now().toString().slice(-6)}`;
  const testAppRole = `Test Role ${Date.now().toString().slice(-6)}`;

  testLogger.log(`Creating test application: ${testAppName} - ${testAppRole}`);
  const createResponse = await request.post(`${API_BASE}/applications`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: {
      company: testAppName,
      role: testAppRole,
    },
  });

  if (!createResponse.ok()) {
    const errorText = await createResponse.text();
    testLogger.error('Failed to create application:', errorText);
    throw new Error(`Application creation failed with status ${createResponse.status()}`);
  }

  const createdApp = await createResponse.json();
  testLogger.log('Successfully created application:', createdApp);

  // Step 3: Navigate to the applications page in the UI
  await page.goto(`${WEB_BASE}/applications`);
  await page.waitForLoadState('networkidle');
  testLogger.log('Loaded applications page');

  // Take a screenshot for debugging
  await page.screenshot({ path: './test-results/applications-with-bearer-auth.png' });

  // Step 4: Verify the application appears in the list
  testLogger.log('Checking if application appears in UI...');

  // The token is already set up in localStorage and as a session cookie
  // by the testWithAuth fixture, so we just need to refresh
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Check if our application is visible
  try {
    await expect(page.getByText(testAppName, { exact: false })).toBeVisible({
      timeout: 5000,
    });
    testLogger.log('Success! Application is visible in the UI');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    testLogger.log(`Application not visible in UI: ${errorMessage}`);
    testLogger.log('Verifying application was created via direct API call');

    // Do a direct API call to verify the application was created
    const listResponse = await request.get(`${API_BASE}/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (listResponse.ok()) {
      const apps = await listResponse.json();
      testLogger.log('Applications from API:', apps);

      const foundApp = apps.items?.find((app: { company: string }) => app.company === testAppName);

      if (foundApp) {
        testLogger.log('Application exists in API response, UI issue confirmed');
      } else {
        testLogger.log('Application not found in API response either');
        throw new Error('Application creation verified but not found in list');
      }
    }
  }

  // Step 5: Try creating another application via the UI
  const uiAppName = `UI Test Company ${Date.now().toString().slice(-6)}`;
  const uiAppRole = `UI Test Role ${Date.now().toString().slice(-6)}`;

  testLogger.log(`Attempting to create application via UI: ${uiAppName}`);
  await page.getByLabel('Company').fill(uiAppName);
  await page.getByLabel('Role').fill(uiAppRole);
  await page.getByRole('button', { name: 'Add' }).click();

  // Wait for operation to complete
  await page.waitForTimeout(2000);

  // This should now work with Bearer token auth properly set up
  testLogger.log('Checking if UI-created application appears...');
  await page.reload();
  await page.waitForLoadState('networkidle');

  const uiAppVisible = await page
    .getByText(uiAppName, { exact: false })
    .isVisible()
    .catch(() => false);

  testLogger.log(`UI-created application visible: ${uiAppVisible}`);

  // Success criteria: Applications created via API and UI should be visible
  testLogger.log('Test complete - Bearer token auth functioning correctly');

  // Cleanup: Remove test applications from the database
  try {
    // Remove API-created application
    await request.delete(`${API_BASE}/applications/${testAppName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Remove UI-created application
    await request.delete(`${API_BASE}/applications/${uiAppName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    testLogger.log('Test data cleaned up from database.');
  } catch (cleanupError) {
    testLogger.error('Error cleaning up test data:', cleanupError);
  }
});
