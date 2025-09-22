import { test, expect } from '@playwright/test';

// Use BASE_URL from environment or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Resume Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/resume-upload`);
    // Optionally clear file input if needed (handled by reload)
  });
  test('should upload a resume and show parsed data', async ({ page }) => {
    test.setTimeout(10000);
    // Page is already loaded in beforeEach
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
    // Read the PDF file into a buffer and upload as a Blob to avoid file locking/race issues
    const fs = await import('fs/promises');
    const path = await import('path');
    const pdfPath = path.resolve(
      'apps/web/tests/assets/Resume_BrianFaker_SoftwareDeveloper_English_v1.pdf'
    );
    const pdfBuffer = await fs.readFile(pdfPath);
    const filePayload = {
      name: 'Resume_BrianFaker_SoftwareDeveloper_English_v1.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    };
    await page.getByTestId('resume-upload-input').setInputFiles(filePayload);
    // Wait for file input to be processed by the UI before continuing
    await page.waitForTimeout(200);
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
