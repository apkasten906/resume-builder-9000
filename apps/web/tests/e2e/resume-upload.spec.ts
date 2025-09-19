import { test, expect } from '@playwright/test';

// Use BASE_URL from environment or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Resume Upload Flow', () => {
  test('should upload a resume and show parsed data', async ({ page }) => {
    test.setTimeout(10000);
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
    const debugText = await page
      .locator('[data-testid="resume-upload-debug"]')
      .textContent()
      .catch(() => '');
    try {
      await expect(page.getByTestId('resume-upload-success')).toBeVisible();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('DEBUG OUTPUT:', debugText);
      throw e;
    }
    await expect(page.getByTestId('parsed-summary')).toContainText('Summary');
    await expect(page.getByTestId('parsed-experience')).toBeVisible();
    await expect(page.getByTestId('parsed-skills')).toBeVisible();
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
