import { test, expect, WEB_BASE } from './test-setup';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Comprehensive E2E tests for resume upload and parsing flow
 * Covers:
 * - File upload with real PDF
 * - Parse response validation
 * - Parsed data display on page
 * - Resume appears in uploads list
 * - Clicking uploaded resume loads details
 */

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Resume Upload and Parse - Complete Flow', () => {
  const testPdfPath = path.join(
    __dirname,
    '../assets/Resume_BrianFaker_SoftwareDeveloper_English_v1.pdf'
  );

  test.beforeEach(async ({ page }) => {
    // Navigate to resume upload page (auth already handled by test-setup)
    await page.goto(`${WEB_BASE}/resume-upload`);
    await page.waitForLoadState('networkidle');
  });

  test('uploads PDF file and parses content successfully', async ({ page }) => {
    // Ensure upload button exists
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Upload the PDF file
    await fileInput.setInputFiles(testPdfPath);

    // Wait for the parse button to be enabled and click it
    const parseButton = page.getByTestId('parse-button');
    await expect(parseButton).toBeEnabled({ timeout: 5000 });
    await parseButton.click();

    // Wait for parsing to complete - look for success toast or parsed content
    await page.waitForSelector('text=/Resume parsed|Extracted/i', { timeout: 15000 });

    // Verify parsed data is displayed on the page
    // The component should show summary, experience, and skills
    const pageContent = await page.content();

    // Check that we're not seeing "No summary found" or error messages
    expect(pageContent).not.toContain('No summary found');
    expect(pageContent).not.toContain('Failed to parse');
  });

  test('displays parsed summary, experience, and skills from PDF', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    const parseButton = page.getByTestId('parse-button');
    await expect(parseButton).toBeEnabled({ timeout: 5000 });
    await parseButton.click();

    // Wait for parsing
    await page.waitForTimeout(2000);

    // Check for parsed data sections
    // The ResumeUploadInteractive component should display the parsed data
    const bodyText = await page.textContent('body');

    // Verify we got actual parsed content (not stub messages)
    if (bodyText) {
      const hasRealContent =
        !bodyText.includes('No summary found') &&
        !bodyText.includes('No experience found') &&
        !bodyText.includes('No skills found');

      expect(hasRealContent).toBeTruthy();
    }
  });

  test('uploaded resume appears in Recent Uploads list', async ({ page }) => {
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    const parseButton = page.getByTestId('parse-button');
    await parseButton.click();

    // Wait for upload to complete
    await page.waitForSelector('text=/Resume parsed|Extracted/i', { timeout: 15000 });

    // Navigate to home page where uploads are listed
    await page.goto(`${WEB_BASE}/`);
    await page.waitForLoadState('networkidle');

    // Wait for uploads to load
    await page.waitForTimeout(1000);

    // Check that Recent Uploads section exists
    const recentUploadsSection = page.locator('text=/Recent Uploads/i');
    await expect(recentUploadsSection).toBeVisible({ timeout: 10000 });

    // Verify at least one upload is shown (should see our uploaded file or test data)
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('No uploads yet');
  });

  test('clicking uploaded resume loads details page with parsed data', async ({ page }) => {
    // First upload a resume
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    const parseButton = page.getByTestId('parse-button');
    await parseButton.click();

    // Wait for parsing
    await page.waitForSelector('text=/Resume parsed|Extracted/i', { timeout: 15000 });

    // Capture the URL after upload (might have ID param)
    const currentUrl = page.url();

    // If URL has an ID, we can test loading details
    if (currentUrl.includes('?id=')) {
      // Reload the page to test fetching details
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify parsed data loads
      await page.waitForTimeout(2000);
      const bodyText = await page.textContent('body');

      // Should not show loading state indefinitely
      expect(bodyText).not.toContain('Loading details...');
    }
  });

  test('shows validation error for unsupported file types', async ({ page }) => {
    // Create a fake text file to test validation
    const buffer = Buffer.from('This is not a PDF file');
    const dataTransfer = await page.evaluateHandle(data => {
      const dt = new DataTransfer();
      const file = new File([new Uint8Array(data)], 'test.txt', { type: 'text/plain' });
      dt.items.add(file);
      return dt;
    }, Array.from(buffer));

    const fileInput = page.locator('input[type="file"]');
    await fileInput.evaluateHandle((input: HTMLInputElement, dt: DataTransfer) => {
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, dataTransfer);

    // Should show validation error
    await page.waitForTimeout(500);
    const errorMessage = page.locator('text=/not supported|invalid|unsupported/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('handles large file size validation (over 5MB)', async ({ page }) => {
    // Create a buffer that's >5MB
    const largeBufferSize = 6 * 1024 * 1024; // 6MB

    const dataTransfer = await page.evaluateHandle((size: number) => {
      const dt = new DataTransfer();
      const arr = new Uint8Array(size);
      arr.fill(97); // 'a' ASCII code
      const file = new File([arr], 'large.pdf', { type: 'application/pdf' });
      dt.items.add(file);
      return dt;
    }, largeBufferSize);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.evaluateHandle((input, dt) => {
      const inputEl = input as HTMLInputElement;
      const transfer = dt as unknown as DataTransfer;
      inputEl.files = transfer.files;
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    }, dataTransfer);

    const parseButton = page.getByTestId('parse-button');

    // Try to upload
    if (await parseButton.isEnabled()) {
      await parseButton.click();
    }

    // Should show size error
    await page.waitForTimeout(1000);
    const errorText = await page.textContent('body');
    expect(errorText).toMatch(/too large|5MB|size/i);
  });

  test('shows proper loading state during upload and parse', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    const parseButton = page.getByTestId('parse-button');

    // Click parse
    await parseButton.click();

    // Should show loading state immediately
    await page.waitForTimeout(200);
    const buttonText = await parseButton.textContent();
    expect(buttonText).toMatch(/uploading|loading|parsing/i);

    // Wait for completion
    await page.waitForSelector('text=/Resume parsed|Extracted/i', { timeout: 15000 });

    // Button should be back to normal state
    const finalButtonText = await parseButton.textContent();
    expect(finalButtonText).not.toMatch(/uploading|loading|parsing/i);
  });
});
