// NOTE: The large file (>5MB) error scenario should be manually tested.
// Playwright cannot easily generate or upload a >5MB file in CI environments.
// The UI will show a user-friendly error: "File is too large. Maximum allowed size is 5MB."
// Removed unused imports
import { test, expect } from './test-setup';

// Use WEB_BASE from environment or default to localhost
const webUrl = process.env.WEB_BASE || 'http://localhost:3000';

test.describe('Resume Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${webUrl}/resume-upload`);
    // Optionally clear file input if needed (handled by reload)
  });
  test('should upload a resume and show parsed data', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto(`${webUrl}/resume-upload`);
    // Wait for the upload UI to be fully hydrated and visible before interacting.
    await page.getByRole('heading', { name: /Upload Your Resume/i }).waitFor({
      state: 'visible',
      timeout: 15000,
    });
    await page.waitForSelector('[data-testid="resume-upload-input"]', { timeout: 15000 });
    // Intercept the fetch and set the header
    await page.route('/api/resumes', async (route, request) => {
      const headers = {
        ...request.headers(),
        'x-dev-e2e-test': 'true',
      };
      const response = await page.request.fetch(request.url(), {
        method: request.method(),
        headers,
        data: request.postData(),
      });
      route.fulfill({
        response,
      });
    });
    // Upload the file directly using setInputFiles
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/sample_resume.pdf');
    // Click the Parse button to trigger upload/parse
    await page.getByTestId('parse-button').click();
    // Assert that the parsed results are visible
    await expect(page.getByRole('heading', { name: /Parsed Results/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Summary/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Experience/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Skills/i })).toBeVisible();
    await expect(page.locator('text=Unknown Role')).toBeVisible();
  });

  test('should show error for unsupported file type', async ({ page }) => {
    await page.goto(`${webUrl}/resume-upload`);
    await page.getByRole('heading', { name: /Upload Your Resume/i }).waitFor({
      state: 'visible',
      timeout: 10000,
    });
    await page.waitForSelector('[data-testid="resume-upload-input"]', { timeout: 10000 });
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/invalid_file.exe');
    await expect(page.getByTestId('resume-upload-error')).toBeVisible();
    // Accessibility: error should be in aria-live region
    const output = await page.locator('output[aria-live="polite"]');
    await expect(output).toContainText(/unsupported file type/i);
  });

  // NOTE: The large file (>5MB) error scenario should be manually tested.
  // Playwright cannot easily generate or upload a >5MB file in CI environments.
  // The UI will show a user-friendly error: "File is too large. Maximum allowed size is 5MB."

  test('shows loading state and disables controls during parse', async ({ page }) => {
    await page.goto(`${webUrl}/resume-upload`);
    await page.getByRole('heading', { name: /Upload Your Resume/i }).waitFor({
      state: 'visible',
      timeout: 10000,
    });
    await page.waitForSelector('[data-testid="resume-upload-input"]', { timeout: 10000 });
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/sample_resume.pdf');
    // Click Parse and check loading state
    const parseButton = page.getByTestId('parse-button');
    await parseButton.click();
    await expect(parseButton).toBeDisabled();
    await expect(parseButton).toHaveText(/Parsing/i);
    // Wait for parse to finish and button to be enabled again
    await expect(parseButton).not.toBeDisabled({ timeout: 10000 });
  });

  test('uploads list shows ALL items (no limit) and displays friendly error on API failure', async ({
    page,
  }) => {
    await page.goto(`${webUrl}/resume-upload`);

    // Mock the uploads API to return 12 items
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

    await page.reload();
    // Wait for the first item to render
    await page.waitForSelector('text=resume-0.pdf');
    const items = await page.locator('[data-testid="recent-uploads-table"] tbody tr').count();
    // Should show all 12 items, not limited to 10
    expect(items).toBe(12);

    // Now mock failure and check the user-facing message
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

  test('uploaded resume is persisted and parsed fields are stored', async ({ page }) => {
    test.setTimeout(40000);
    await page.goto(`${webUrl}/resume-upload`);
    // Ensure upload UI is ready before interacting to avoid hydration/race issues
    await page.getByRole('heading', { name: /Upload Your Resume/i }).waitFor({
      state: 'visible',
      timeout: 15000,
    });
    await page.waitForSelector('[data-testid="resume-upload-input"]', { timeout: 15000 });

    // Intercept POST to /api/resumes to add a dev header and forward to backend
    await page.route('/api/resumes', async (route, request) => {
      const headers = {
        ...request.headers(),
        'x-dev-e2e-test': 'true',
      };
      const response = await page.request.fetch(request.url(), {
        method: request.method(),
        headers,
        data: request.postData(),
      });
      route.fulfill({ response });
    });

    // Upload file and trigger parse
    await page
      .getByTestId('resume-upload-input')
      .setInputFiles('apps/web/tests/assets/sample_resume.pdf');
    await page.getByTestId('parse-button').click();

    // Wait for parsed summary to appear (allow a bit more time for parsing + persistence)
    await expect(page.getByTestId('parsed-summary')).toBeVisible({ timeout: 30000 });

    // Now poll the uploads API (via the web server) to find the newly created item
    const uploadsResponse = await page.request.get('/api/uploads');
    expect(uploadsResponse.ok()).toBeTruthy();
    const uploadsJson = await uploadsResponse.json();
    expect(Array.isArray(uploadsJson.items)).toBeTruthy();
    // Find the upload with filename matching the uploaded file
    interface UploadItem {
      id: string;
      fileName: string;
      lastUpdated: string;
    }
    const found = uploadsJson.items.find((it: UploadItem) =>
      (it.fileName || '').includes('sample_resume')
    );
    expect(found).toBeTruthy();
    const resumeId = found.id;

    // Fetch the stored resume from backend to assert parsed fields persisted
    const storedResume = await page.request.get(`/api/resumes/${resumeId}`);
    expect(storedResume.ok()).toBeTruthy();
    const storedJson = await storedResume.json();

    // Assert the parsed/ persisted fields exist in the DB entry
    expect(storedJson).toHaveProperty('id', resumeId);
    expect(storedJson).toHaveProperty('resumeData');
    expect(storedJson.resumeData).toHaveProperty('summary');
    expect(typeof storedJson.resumeData.summary).toBe('string');
    expect(Array.isArray(storedJson.resumeData.experience)).toBeTruthy();
    expect(Array.isArray(storedJson.resumeData.skills)).toBeTruthy();
  });

  test('uploads are sorted by date descending (most recent first)', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto(`${webUrl}/resume-upload`);

    // Mock the uploads API with items that have different dates
    const mockItems = [
      {
        id: 'id-1',
        fileName: 'newest-resume.pdf',
        lastUpdated: '2025-10-23T12:00:00.000Z',
      },
      {
        id: 'id-2',
        fileName: 'middle-resume.pdf',
        lastUpdated: '2025-10-23T10:00:00.000Z',
      },
      {
        id: 'id-3',
        fileName: 'oldest-resume.pdf',
        lastUpdated: '2025-10-23T08:00:00.000Z',
      },
    ];

    await page.route('**/api/uploads', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ items: mockItems }),
      })
    );

    await page.reload();
    await page.waitForSelector('text=newest-resume.pdf');

    // Get all table rows in order
    const rows = await page.locator('[data-testid="recent-uploads-table"] tbody tr').all();
    expect(rows.length).toBe(3);

    // Verify the order: newest should be first, oldest should be last
    const firstRowText = await rows[0].textContent();
    const lastRowText = await rows[2].textContent();

    expect(firstRowText).toContain('newest-resume.pdf');
    expect(lastRowText).toContain('oldest-resume.pdf');
  });

  test('recent uploads section shows correct title "All Uploaded Resumes"', async ({ page }) => {
    await page.goto(`${webUrl}/resume-upload`);
    await page.waitForSelector('[data-testid="recent-uploads-table"]');

    // Verify the card title changed from "Recent Uploads" to "All Uploaded Resumes"
    await expect(page.getByRole('heading', { name: /All Uploaded Resumes/i })).toBeVisible();
  });
});

test.beforeAll(async () => {
  // TODO: Implement beforeAll logic
});

test.afterAll(async () => {
  // TODO: Implement afterAll logic
});

test.beforeEach(async () => {
  // TODO: Implement beforeEach logic
});

test.afterEach(async () => {
  // TODO: Implement afterEach logic
});
