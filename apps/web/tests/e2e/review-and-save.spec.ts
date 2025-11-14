import { test, expect } from './test-setup';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { generateSamplePdf } from './utils/generatePdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Resume review and save flow', () => {
  test('upload -> review -> save with consent sends correct payload', async ({ page }) => {
    const fixturePath = path.join(__dirname, 'fixtures', 'sample.pdf');
    await generateSamplePdf(fixturePath);

    // Intercept parse response to return parsed regions (client posts to /api/resume)
    await page.route('**/api/resume', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            summary: 'Summary: Experienced software engineer with 5+ years in web development.',
            experience: ['Software Engineer at Acme Corp, 2018-2023'],
            skills: ['JavaScript', 'TypeScript'],
            regions: [
              {
                id: 'r1',
                page: 1,
                bbox: [50, 650, 400, 40],
                text: 'Summary: Experienced...',
                category: 'contact',
              },
            ],
            pageWidth: 612,
            pageHeight: 792,
          }),
        });
        return;
      }
      route.continue();
    });

    // Capture save request
    let saveRequestBody: Record<string, unknown> | null = null;
    await page.route('**/api/resumes/save', async route => {
      if (route.request().method() === 'POST') {
        const req = route.request();
        const post = await req.postData();
        saveRequestBody = post ? (JSON.parse(post) as Record<string, unknown>) : {};
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, savedId: 123 }),
        });
        return;
      }
      await route.continue();
    });

    // Navigate to upload page
    await page.goto('/resume-upload');
    await page.waitForLoadState('domcontentloaded');

    // Wait for file input with longer timeout to handle Suspense
    const input = await page.waitForSelector('input[type=file]', {
      state: 'attached',
      timeout: 10000,
    });
    await input.setInputFiles(fixturePath);
    await page.click('[data-testid="parse-button"]');

    // Wait for parsed summary to appear
    await expect(page.locator('[data-testid="parsed-summary"]')).toHaveText(/Experienced/);

    // Open review panel save and accept consent
    await page.click('[data-testid="open-consent"]');
    // Wait for the consent modal to appear and be fully interactive
    await page.waitForSelector('[data-testid="consent-notice"]', { state: 'visible' });
    await page.waitForTimeout(100); // Small delay for modal animation
    await page.click('[data-testid="consent-accept"]');

    // Wait for save to complete and confirm request body
    await page.waitForResponse('**/api/resumes/save');
    expect(saveRequestBody).not.toBeNull();

    // Narrow to non-null for assertions
    if (!saveRequestBody) throw new Error('Save request body was not captured');
    const body = saveRequestBody as Record<string, unknown>;
    expect((body['consent'] as boolean) === true).toBe(true);
    expect(Array.isArray(body['regions'])).toBe(true);
  });
});
