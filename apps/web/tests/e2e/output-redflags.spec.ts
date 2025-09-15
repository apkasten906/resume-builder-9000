import { test, expect } from '@playwright/test';

test.describe('Output and Red Flags', () => {
  test('should generate output files and allow download', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('run-tailor-btn').click();
    await expect(page.getByTestId('download-resume-md')).toBeVisible();
    await expect(page.getByTestId('download-resume-txt')).toBeVisible();
  });

  test('should surface missing must-haves and page length issues', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('run-tailor-btn').click();
    await expect(page.getByTestId('redflag-missing-musthave')).toBeVisible();
    await expect(page.getByTestId('redflag-page-length')).toBeVisible();
  });
});
