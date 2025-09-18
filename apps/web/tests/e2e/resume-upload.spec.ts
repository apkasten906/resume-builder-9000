import { test, expect } from '@playwright/test';

// Use BASE_URL from environment or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Resume Upload Flow', () => {
  test('should upload a resume and show parsed data', async ({ page }) => {
    await page.goto(`${BASE_URL}/resume-upload`);
    // Use a path that works both locally and in Docker
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/sample_resume.pdf');
    await expect(page.getByTestId('resume-upload-success')).toBeVisible();
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
