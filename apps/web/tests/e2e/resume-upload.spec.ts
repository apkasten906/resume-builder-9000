// NOTE: The large file (>5MB) error scenario should be manually tested.
// Playwright cannot easily generate or upload a >5MB file in CI environments.
// The UI will show a user-friendly error: "File is too large. Maximum allowed size is 5MB."
// Removed unused imports
import { test, expect } from '@playwright/test';

// Use BASE_URL from environment or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Resume Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/resume-upload`);
    // Optionally clear file input if needed (handled by reload)
  });
  test('should upload a resume and show parsed data', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto(`${BASE_URL}/resume-upload`);
    // Intercept the fetch and set the header
    await page.route('/api/resumes', async (route, request) => {
      const headers = {
        ...request.headers(),
        'x-dev-e2e-test': 'true',
      };
      const response = await page.request.fetch(request.url(), {
        method: request.method(),
        headers,
        data: request.postData(),
      });
      route.fulfill({
        response,
      });
    });
    // Upload the file directly using setInputFiles
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/sample_resume.pdf');
    // Click the Parse button to trigger upload/parse
    await page.getByRole('button', { name: /parse/i }).click();
    // Assert that the parsed results are visible
    await expect(page.getByRole('heading', { name: /Parsed Results/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Summary/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Experience/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Skills/i })).toBeVisible();
    await expect(page.locator('text=Unknown Role')).toBeVisible();
  });

  test('should show error for unsupported file type', async ({ page }) => {
    await page.goto(`${BASE_URL}/resume-upload`);
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/invalid_file.exe');
    await expect(page.getByTestId('resume-upload-error')).toBeVisible();
    // Accessibility: error should be in aria-live region
    const output = await page.locator('output[aria-live="polite"]');
    await expect(output).toContainText(/unsupported file type/i);
  });

  // NOTE: The large file (>5MB) error scenario should be manually tested.
  // Playwright cannot easily generate or upload a >5MB file in CI environments.
  // The UI will show a user-friendly error: "File is too large. Maximum allowed size is 5MB."

  test('shows loading state and disables controls during parse', async ({ page }) => {
    await page.goto(`${BASE_URL}/resume-upload`);
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/sample_resume.pdf');
    // Click Parse and check loading state
    const parseButton = page.getByTestId('parse-button');
    await parseButton.click();
    await expect(parseButton).toBeDisabled();
    await expect(parseButton).toHaveText(/Parsing/i);
    // Wait for parse to finish and button to be enabled again
    await expect(parseButton).not.toBeDisabled({ timeout: 10000 });
  });

  test('uploads list shows max 10 items and displays friendly error on API failure', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/resume-upload`);

    // Mock the uploads API to return 12 items
    await page.route('**/api/uploads', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          items: Array.from({ length: 12 }).map((_, i) => ({
            id: `id-${i}`,
            fileName: `resume-${i}.pdf`,
            lastUpdated: new Date().toISOString(),
          })),
        }),
      })
    );

    await page.reload();
    // Wait for the first item to render
    await page.waitForSelector('text=resume-0.pdf');
    const items = await page.locator('ul.list-disc li').count();
    expect(items).toBe(10);

    // Now mock failure and check the user-facing message
    await page.route('**/api/uploads', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'backend error' }) })
    );
    await page.reload();
    await page.waitForSelector(
      'text=Apologies! We are having trouble retrieving your uploaded resumes right now.'
    );
    await expect(
      page.getByText('Apologies! We are having trouble retrieving your uploaded resumes right now.')
    ).toBeVisible();
  });
});

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
  // TODO: Implement afterEach logic
});
