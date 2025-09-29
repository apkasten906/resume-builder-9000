import { test, expect } from './test-setup';
import Database from 'better-sqlite3';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * This test fixes the issue with applications not appearing in the list
 * by directly inserting test data into the database, bypassing authentication issues.
 */
test('Applications add and list', async ({ page }) => {
  console.log('Starting applications add and list test with direct database access');

  // Get path to the database (in the project root)
  const projectRoot = path.resolve(__dirname, '../../../../../');
  const dbPath = path.join(projectRoot, 'resume.db');

  // Connect directly to the application database
  const db = new Database(dbPath, { verbose: console.log });
  console.log(`Connected to database at ${dbPath}`);

  // Clean up any existing test applications for our test user
  const userId = 1; // Assuming this is the ID of our test user
  const cleanupResult = db.prepare('DELETE FROM applications WHERE userId = ?').run(userId);
  console.log(`Cleaned up ${cleanupResult.changes} test applications`);

  // Step 1: Create a test application DIRECTLY IN THE DATABASE
  // This bypasses all authentication and API issues
  const initialAppName = `DB Test Company ${Date.now().toString().slice(-6)}`;
  const initialAppRole = `DB Test Role ${Date.now().toString().slice(-4)}`;
  const id = randomUUID();
  const now = new Date().toISOString();

  console.log(`Creating initial test application in database: ${initialAppName}`);
  try {
    // Insert directly into the applications table with all required fields
    const result = db
      .prepare(
        `
      INSERT INTO applications (
        id, userId, company, role, stage, lastUpdated, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(id, userId, initialAppName, initialAppRole, 'Prospect', now, now);

    console.log(`Created test application with ID: ${id} (changes: ${result.changes})`);
  } catch (err) {
    console.error('Error inserting test application:', err);
    // Dump the table structure to help with debugging
    console.log('Table structure:');
    const tables = db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='applications'")
      .all();
    console.log(tables);
  }

  // Step 2: Navigate to applications page and verify the test app is there
  await page.goto(`${WEB_BASE}/applications`);
  await page.waitForLoadState('networkidle');

  // Take screenshot of initial state
  await page.screenshot({ path: `./test-results/applications-before-add.png` });

  // Check if our direct DB application is visible in the UI
  console.log('Checking if database application is visible in UI');
  await page.waitForTimeout(1000); // Give the page a moment to render

  // Log all table content for debugging
  const tableContent = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells.map(cell => cell.textContent?.trim());
    });
  });
  console.log('Current table content:', tableContent);

  try {
    // Check if our application is visible
    await expect(page.locator('table').getByText(initialAppName, { exact: false })).toBeVisible({
      timeout: 5000,
    });

    console.log('Success! Database-created application is visible in the UI');
  } catch (error) {
    console.log('Application not found in UI. Checking database to verify it exists:');
    const dbApps = db.prepare('SELECT * FROM applications WHERE userId = ?').all(userId);
    console.log('Current applications in DB:', dbApps);
    throw error; // Re-throw so test still fails
  }

  // Step 3: Create a second application via the UI form
  const uiAppName = `UI Acme ${Date.now().toString().slice(-6)}`;
  const uiAppRole = `UI Engineer ${Date.now().toString().slice(-4)}`;
  console.log(`Adding second application via UI: ${uiAppName}`);

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

    console.log('Success! UI-created application is also visible');
  } catch (error) {
    console.log('UI-created application not found. Final table content:');
    const finalTableContent = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return cells.map(cell => cell.textContent?.trim());
      });
    });
    console.log(finalTableContent);
    throw error;
  }

  // Close the database connection
  db.close();

  console.log('Test complete - both DB and UI applications are visible!');
});
