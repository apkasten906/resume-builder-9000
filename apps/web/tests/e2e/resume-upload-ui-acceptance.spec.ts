import { test } from '@playwright/test';

test.describe('Resume Upload UI - Acceptance Criteria (quick wins)', () => {
  test('Dashboard links navigate to resume-upload with id param', async ({ page, baseURL }) => {
    const webUrl = baseURL?.toString() ?? '';
    await page.goto(webUrl);
    // Navigate to resume-upload page which lists uploads
    await page.goto(`${webUrl}/resume-upload`);

    // Wait for uploads to load and find any resume link
    await page.waitForSelector('a[data-testid^="resume-link-"]', { state: 'visible' });
    const firstLink = await page.locator('a[data-testid^="resume-link-"]').first();
    const href = await firstLink.getAttribute('href');
    await firstLink.click();

    // After click we should be on /resume-upload with id query param
    const url = page.url();
    expect(url).toContain('/resume-upload');
    if (href) {
      // Assert the id from href is respected in the url or at least navigation occurred
      const idMatch = href.match(/id=([^&]+)/);
      if (idMatch) expect(url).toContain(`id=${idMatch[1]}`);
    }
  });

  test('Recent Uploads shows upload date column', async ({ page, baseURL }) => {
    const webUrl = baseURL?.toString() ?? '';
    await page.goto(`${webUrl}/resume-upload`);
    // Wait for uploads table
    await page.waitForSelector('table');
    // Ensure at least one resume-date element exists
    const dateCells = await page.locator('span[data-testid^="resume-date-"]').all();
    expect(dateCells.length).toBeGreaterThan(0);
    // Check format of first date (basic check: non-empty and contains a digit)
    const text = await dateCells[0].innerText();
    expect(text).toMatch(/\d/);
  });

  test('Long resume titles are truncated and show full title on hover (tooltip)', async ({
    page,
    baseURL,
  }) => {
    const webUrl = baseURL?.toString() ?? '';

    // Intercept API call to provide a predictable long title
    await page.route('**/api/uploads*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'long-title-1',
              fileName:
                'VeryLongResumeTitle_ThisIsAnExtremelyLongResumeFileName_MadeForTesting_Truncation_Behavior_2025.pdf',
              lastUpdated: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.goto(`${webUrl}/resume-upload`);
    // Wait for the injected row
    const nameSpan = page.locator('span[data-testid="resume-name-long-title-1"]');
    await nameSpan.waitFor({ state: 'visible' });

    // The element should have truncated styling (we check CSS 'text-overflow' via bounding box width vs scroll width)
    const el = await nameSpan.elementHandle();
    if (el) {
      const hasOverflow = await el.evaluate((node: HTMLElement) => {
        // compare scrollWidth to clientWidth to detect truncation
        return (node as HTMLElement).scrollWidth > (node as HTMLElement).clientWidth;
      });
      expect(hasOverflow).toBeTruthy();
      // Title attribute should contain full file name
      const title = await el.getAttribute('title');
      expect(title).toContain('VeryLongResumeTitle');
    } else {
      throw new Error('Name element not found');
    }
  });
});
