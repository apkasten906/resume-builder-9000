import { expect, testWithAuth } from './test-setup';
import { testLogger } from './utils/test-logger';
import fs from 'fs';

const WEB_BASE = process.env['WEB_BASE'] || 'http://localhost:3000';

// Output and Red Flags tests
testWithAuth('should generate output files and allow download', async ({ page }) => {
  testLogger.log('Starting output file generation test');
  
  // Navigate to the output generation page
  await page.goto(`${WEB_BASE}/resume-output`, { waitUntil: 'networkidle' });
  
  // Take a screenshot of the output page
  await fs.promises.mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/output-page.png', fullPage: true });
  
  // Select a resume to generate output for
  await page.locator('select[name="resumeId"]').selectOption({ index: 0 });
  
  // Select output formats (PDF and DOCX)
  await page.getByLabel('PDF').check();
  await page.getByLabel('DOCX').check();
  
  // Click the generate button
  await page.getByRole('button', { name: /generate|create|build/i }).click();
  
  // Wait for generation to complete
  await page.waitForSelector('text=Generation complete', { timeout: 15000 });
  
  // Verify download links are available
  const pdfDownloadLink = page.getByRole('link', { name: /pdf/i });
  const docxDownloadLink = page.getByRole('link', { name: /docx/i });
  
  await expect(pdfDownloadLink).toBeVisible();
  await expect(docxDownloadLink).toBeVisible();
  
  // Take a screenshot of the output with download options
  await page.screenshot({ path: 'test-results/output-downloads.png', fullPage: true });
  
  testLogger.log('Successfully generated output files with download links');
});

testWithAuth('should surface missing must-haves and page length issues', async ({ page }) => {
  testLogger.log('Starting red flags test');
  
  // Navigate to the resume validator page
  await page.goto(`${WEB_BASE}/resume-validator`, { waitUntil: 'networkidle' });
  
  // Take a screenshot of the validator page
  await fs.promises.mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/validator-page.png', fullPage: true });
  
  // Select a resume to validate
  await page.locator('select[name="resumeId"]').selectOption({ index: 0 });
  
  // Select a job posting to validate against
  await page.locator('select[name="jobId"]').selectOption({ index: 0 });
  
  // Click the validate button
  await page.getByRole('button', { name: /validate|check|analyze/i }).click();
  
  // Wait for validation to complete
  await page.waitForSelector('text=Validation Results', { timeout: 10000 });
  
  // Check for red flags section
  const redFlagsSection = page.locator('.red-flags-section');
  await expect(redFlagsSection).toBeVisible();
  
  // Check for specific red flag categories
  const missingSkills = page.locator('.missing-skills');
  const pageLengthWarning = page.locator('.page-length-warning');
  
  // At least one of these warnings should be visible
  const hasWarnings = await Promise.any([
    missingSkills.isVisible().then(visible => visible),
    pageLengthWarning.isVisible().then(visible => visible),
  ]);
  
  expect(hasWarnings).toBeTruthy();
  
  // Take a screenshot of the validation results
  await page.screenshot({ path: 'test-results/validation-results.png', fullPage: true });
  
  testLogger.log('Successfully displayed red flags and validation results');
});
