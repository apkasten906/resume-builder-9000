import { test, expect } from '@playwright/test';

// Resume Upload and Parsing - enabled tests
test.describe('Resume Upload Flow', () => {
  // Resume Upload UI implemented: tests enabled

  test('should upload a resume and show parsed data', async ({ page }) => {
    await page.goto('/resume-upload');
    // Use a path that works both locally and in Docker
    await page.getByTestId('resume-upload-input').setInputFiles('../assets/sample_resume.pdf');
    await expect(page.getByTestId('resume-upload-success')).toBeVisible();
    await expect(page.getByTestId('parsed-summary')).toContainText('Summary');
    await expect(page.getByTestId('parsed-experience')).toBeVisible();
    await expect(page.getByTestId('parsed-skills')).toBeVisible();
  });

  test('should show error for unsupported file type', async ({ page }) => {
    await page.goto('/resume-upload');
    // Use a path that works both locally and in Docker
    await page.getByTestId('resume-upload-input').setInputFiles('../assets/invalid_file.exe');
    await expect(page.getByTestId('resume-upload-error')).toBeVisible();
  });
});
