import { test, expect } from '@playwright/test';

// This is a scaffolded E2E test for the Resume Upload feature.
// It is intentionally skipped until the dev server and fixture are available.

test.skip('resume upload -> parse -> preview receives parsed regions (scaffold)', async ({
  page,
}) => {
  // TODO: add fixture PDF and enable the test
  const base = process.env.WEB_BASE ?? 'http://localhost:3000';
  await page.goto(`${base}/resume-upload`);
  // The page should contain the upload input
  await expect(page.locator('[data-testid="resume-upload-input"]')).toBeVisible();

  // Further steps (attach file, wait for parsed results) will be implemented once a test fixture is added.
});
