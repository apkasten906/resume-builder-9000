import { test, expect } from '@playwright/test';

// Resume Upload and Parsing

test.describe('Resume Upload Flow', () => {
  // Resume Upload UI implemented: tests enabled

  test('should upload a resume and show parsed data', async ({ page }) => {
    await page.goto('http://localhost:3000/resume-upload');
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/sample_resume.pdf');
    await expect(page.getByTestId('resume-upload-success')).toBeVisible();
    await expect(page.getByTestId('parsed-summary')).toContainText('Summary');
    await expect(page.getByTestId('parsed-experience')).toBeVisible();
    await expect(page.getByTestId('parsed-skills')).toBeVisible();
  });

  test('should show error for unsupported file type', async ({ page }) => {
    await page.goto('http://localhost:3000/resume-upload');
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/invalid_file.exe');
    await expect(page.getByTestId('resume-upload-error')).toBeVisible();
  });
});
