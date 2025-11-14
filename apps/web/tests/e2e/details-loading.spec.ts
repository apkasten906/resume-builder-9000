import { test, expect } from './test-setup';

test.describe('Resume Details Loading', () => {
  test('clicking on uploaded resume loads and displays resume details', async ({ page }) => {
    // Navigate to resume-upload page
    await page.goto('/resume-upload');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the Recent Uploads table to load
    await page.waitForSelector('table[data-testid="recent-uploads-table"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Wait for at least one resume link to appear
    const resumeLink = page.locator('a[data-testid^="resume-link-"]').first();
    await resumeLink.waitFor({ state: 'visible', timeout: 10000 });

    // Get the resume ID from the href before clicking
    const href = await resumeLink.getAttribute('href');
    expect(href).toBeTruthy();
    const idMatch = href?.match(/id=([^&]+)/);
    expect(idMatch).toBeTruthy();
    const resumeId = idMatch?.[1];

    // Click the resume link
    await resumeLink.click();

    // Verify URL contains the id parameter
    await expect(page).toHaveURL(new RegExp(`/resume-upload\\?id=${resumeId}`));

    // Wait for the resume details to load
    // The component should fetch the resume data and display the parsed summary
    await page.waitForSelector('[data-testid="parsed-summary"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Verify the parsed summary contains content
    const parsedSummary = page.locator('[data-testid="parsed-summary"]');
    const summaryText = await parsedSummary.textContent();
    expect(summaryText).toBeTruthy();
    expect(summaryText?.length).toBeGreaterThan(0);

    // Verify no error message is displayed
    const errorMessage = page.locator('[data-testid="resume-upload-error"]');
    await expect(errorMessage).not.toBeVisible();
  });

  test('resume details API returns correct data structure', async ({ request }) => {
    // First, get a resume ID from the uploads list
    const uploadsResponse = await request.get('/api/uploads');
    expect(uploadsResponse.ok()).toBeTruthy();

    const uploadsData = await uploadsResponse.json();
    expect(uploadsData.items).toBeDefined();
    expect(Array.isArray(uploadsData.items)).toBeTruthy();

    if (uploadsData.items.length === 0) {
      test.skip();
      return;
    }

    const firstResume = uploadsData.items[0];
    const resumeId = firstResume.id;

    // Fetch the resume details
    const detailsResponse = await request.get(`/api/resumes/${resumeId}`);
    expect(detailsResponse.ok()).toBeTruthy();

    const detailsData = await detailsResponse.json();

    // Verify the response structure
    expect(detailsData.id).toBe(resumeId);
    expect(detailsData.resumeData).toBeDefined();
    expect(detailsData.createdAt).toBeDefined();

    // Verify resumeData has expected fields
    expect(detailsData.resumeData.summary).toBeDefined();
    expect(Array.isArray(detailsData.resumeData.experience)).toBeTruthy();
    expect(Array.isArray(detailsData.resumeData.skills)).toBeTruthy();
  });

  test('shows error message when resume details fail to load', async ({ page }) => {
    // Navigate directly to resume-upload with an invalid ID
    await page.goto('/resume-upload?id=non-existent-id-12345');
    await page.waitForLoadState('domcontentloaded');

    // Wait for error handling to complete
    await page.waitForTimeout(2000);

    // Check if either an error message is shown OR the page shows no parsed data
    const errorMessage = page.locator('[data-testid="resume-upload-error"]');
    const parsedSummary = page.locator('[data-testid="parsed-summary"]');

    // Either error should be visible OR parsed summary should not contain valid data
    const errorVisible = await errorMessage.isVisible().catch(() => false);
    const summaryVisible = await parsedSummary.isVisible().catch(() => false);

    // If summary is visible, it should be empty or show a default message
    if (summaryVisible && !errorVisible) {
      const text = await parsedSummary.textContent();
      // Should either be empty or show a loading/error state
      expect(text === '' || text?.includes('trouble')).toBeTruthy();
    } else {
      // Error message should be visible
      expect(errorVisible).toBeTruthy();
    }
  });

  test('resume details persist on page reload', async ({ page }) => {
    // Navigate to resume-upload page and click on a resume
    await page.goto('/resume-upload');
    await page.waitForLoadState('domcontentloaded');

    const resumeLink = page.locator('a[data-testid^="resume-link-"]').first();
    await resumeLink.waitFor({ state: 'visible', timeout: 10000 });

    const href = await resumeLink.getAttribute('href');
    const idMatch = href?.match(/id=([^&]+)/);
    const resumeId = idMatch?.[1];

    await resumeLink.click();

    // Wait for details to load
    await page.waitForSelector('[data-testid="parsed-summary"]', {
      state: 'visible',
      timeout: 10000,
    });
    const originalSummary = await page.locator('[data-testid="parsed-summary"]').textContent();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify URL still contains the id
    await expect(page).toHaveURL(new RegExp(`/resume-upload\\?id=${resumeId}`));

    // Wait for details to load again
    await page.waitForSelector('[data-testid="parsed-summary"]', {
      state: 'visible',
      timeout: 10000,
    });
    const reloadedSummary = await page.locator('[data-testid="parsed-summary"]').textContent();

    // Verify the same data is displayed
    expect(reloadedSummary).toBe(originalSummary);
  });
});
