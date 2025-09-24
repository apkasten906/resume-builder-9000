import { test, expect } from '@playwright/test';

// Use BASE_URL from environment or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Resume Upload Flow', () => {
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
    // Use a path that works both locally and in Docker
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/invalid_file.exe');
    await expect(page.getByTestId('resume-upload-error')).toBeVisible();
  });
});
