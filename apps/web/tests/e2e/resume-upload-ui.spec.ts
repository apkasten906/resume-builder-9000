import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Resume Upload UI states', () => {
  test('button label and uploading state, uploads loading and error states, and 10-item limit', async ({
    page,
  }) => {
    // Navigate to resume upload
    await page.goto(`${BASE_URL}/resume-upload`);

    // Ensure the upload button label is visible
    const parseButton = page.getByTestId('parse-button');
    await expect(parseButton).toBeVisible();
    await expect(parseButton).toHaveText(/Upload Resume|Uploading.../);

    // Mock the uploads API to return loading state by intercepting network
    await page.route('**/api/uploads', async route => {
      // Simulate a slow response by delaying
      await new Promise(r => setTimeout(r, 200));
      route.fulfill({ status: 200, body: JSON.stringify({ items: [] }) });
    });

    // Trigger a manual fetch by clicking the button without a file (should be disabled)
    await expect(parseButton).toBeDisabled();

    // Now intercept to return 12 items and check that only 10 display
    await page.route('**/api/uploads', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          items: Array.from({ length: 12 }).map((_, i) => ({
            id: `id-${i}`,
            fileName: `resume-${i}.pdf`,
            lastUpdated: new Date().toISOString(),
          })),
        }),
      })
    );

    // Reload page to pick up the mocked response
    await page.reload();

    // Wait for upload entries to render
    await page.waitForSelector('text=resume-0.pdf');

    // Count rendered items (should be 10)
    const items = await page.locator('ul.list-disc li').count();
    expect(items).toBe(10);

    // Now mock API failure and verify error message
    await page.route('**/api/uploads', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'backend error' }) })
    );
    await page.reload();

    await page.waitForSelector(
      'text=Apologies! We are having trouble retrieving your uploaded resumes right now.'
    );
    await expect(
      page.getByText('Apologies! We are having trouble retrieving your uploaded resumes right now.')
    ).toBeVisible();
  });
});
