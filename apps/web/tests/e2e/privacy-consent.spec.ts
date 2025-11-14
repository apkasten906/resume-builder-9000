import { test, expect } from './test-setup';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { generateSamplePdf } from './utils/generatePdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Privacy / consent', () => {
  test('canceling consent does not POST save request', async ({ page }) => {
    const fixturePath = path.join(__dirname, 'fixtures', 'sample.pdf');
    await generateSamplePdf(fixturePath);

    // Intercept parse response to return parsed regions (client posts to /api/resume)
    await page.route('**/api/resume', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ regions: [] }),
        });
        return;
      }
      route.continue();
    });

    let saveCalled = false;
    await page.route('**/api/resumes/save', route => {
      if (route.request().method() === 'POST') {
        saveCalled = true;
      }
      route.continue();
    });

    await page.goto('/resume-upload');
    await page.waitForLoadState('domcontentloaded');
    // Wait for file input with longer timeout to handle Suspense
    const input = await page.waitForSelector('input[type=file]', {
      state: 'attached',
      timeout: 10000,
    });
    await input.setInputFiles(fixturePath);
    await page.click('[data-testid="parse-button"]');

    // Wait for UI parse handling
    await page
      .waitForSelector('[data-testid="parsed-summary"]', { state: 'attached', timeout: 3000 })
      .catch(() => {});

    // Open consent modal then cancel
    await page.click('[data-testid="open-consent"]');
    await page.click('[data-testid="consent-cancel"]');

    // short pause to allow any accidental requests
    await page.waitForTimeout(500);
    expect(saveCalled).toBe(false);
  });
});
