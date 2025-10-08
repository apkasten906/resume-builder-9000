import { test, expect } from '@playwright/test';
// Removed unused import
import { testLogger } from './utils/test-logger';

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

test.describe('Output and Red Flags', () => {
  test('should generate output files and allow download', async ({ page }) => {
    try {
      testLogger.log('Starting output generation test');
      await page.goto(`${WEB_BASE}/output`);

      // Select a resume from dropdown (assuming there's a dropdown to select resumes)
      await page.locator('select[name="resumeId"]').selectOption({ index: 0 });

      // Click generate button
      await page.getByRole('button', { name: /generate|create|export/i }).click();

      // Wait for generation to complete
      await expect(page.getByText(/generated successfully|ready for download/i)).toBeVisible({
        timeout: 15000,
      });

      // Check that download buttons are present
      const downloadButtons = page.getByRole('button', { name: 'Download' });
      await expect(downloadButtons.first()).toBeVisible();
      await expect(downloadButtons).toHaveCount(2); // Expect PDF and DOCX formats

      testLogger.log('Output generation test completed successfully');
    } catch (error) {
      testLogger.error('Error in output generation test:', error);
      throw error; // Fail the test properly instead of skipping
    }
  });

  test('should surface missing must-haves and page length issues', async ({ page }) => {
    try {
      testLogger.log('Starting red flags test');
      await page.goto(`${WEB_BASE}/output`);

      // Select a resume from dropdown
      await page.locator('select#resumeSelect').selectOption({ index: 0 });

      // Click generate button
      await page.getByRole('button', { name: /generate resume/i }).click();

      // Wait for generation to complete
      await expect(page.getByText(/generation complete/i)).toBeVisible({
        timeout: 10000,
      });

      // Check that red flags section is visible
      await expect(page.getByText(/red flags/i)).toBeVisible();

      // Check for specific red flags
      await expect(page.getByText(/missing keywords/i)).toBeVisible();
      await expect(page.getByText(/page/i).and(page.getByText(/pages/i))).toBeVisible();

      testLogger.log('Red flags test completed successfully');
    } catch (error) {
      testLogger.error('Error in red flags test:', error);
      throw error; // Fail the test properly instead of skipping
    }
  });
});
