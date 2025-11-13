import { test, expect, WEB_BASE } from './test-setup';

const resumeFile = 'apps/web/tests/assets/Resume_BrianFaker_SoftwareDeveloper_English_v1.pdf';
const summarySnippet =
  'Experienced Full Stack Developer seeking to return to development role after spending some time working in leadership and coaching roles.';
const experienceTitle = 'Agile Coach';
const companyName = 'NotReal Telecom';
const educationInstitution = 'University of Surreality';
const educationDegree = 'B.Sc. Computer Science';
const skillExample = 'C# .NET';

test.describe('Resume upload parsing fidelity', () => {
  test('uploads Brian Faker resume and surfaces structured data in details view', async ({ page }) => {
    await page.goto(`${WEB_BASE}/resume-upload`);

    // Add test header so backend can treat the upload as an automated test run if needed.
    await page.route('**/api/resumes', async (route, request) => {
      const response = await page.request.fetch(request.url(), {
        method: request.method(),
        headers: {
          ...request.headers(),
          'x-dev-e2e-test': 'resume-upload-details',
        },
        data: request.postData(),
      });
      await route.fulfill({ response });
    });

    await page.getByTestId('resume-upload-input').setInputFiles(resumeFile);
    const uploadsResponsePromise = page.waitForResponse(response => {
      return (
        response.url().endsWith('/api/uploads') &&
        response.request().method() === 'GET' &&
        response.status() === 200
      );
    });
    await page.getByTestId('parse-button').click();

    await expect(page.getByTestId('parsed-summary')).toContainText(summarySnippet, {
      timeout: 20000,
    });
    await expect(page.getByTestId('parsed-experience')).toContainText(experienceTitle);
    await expect(page.getByTestId('parsed-skills')).toContainText(skillExample);

    const uploadsResponse = await uploadsResponsePromise;
    const uploadsPayload = (await uploadsResponse.json()) as { items?: Array<{ id: string; fileName: string }> };
    const targetUpload =
      uploadsPayload.items?.find(item =>
        item.fileName.includes('Resume_BrianFaker_SoftwareDeveloper_English_v1.pdf')
      ) ?? null;
    expect(targetUpload, 'Uploaded resume should appear in recent uploads API payload').not.toBeNull();

    await page.goto(`${WEB_BASE}/resume-details?id=${targetUpload!.id}`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('parsed-summary-input')).toHaveValue(
      new RegExp(summarySnippet.slice(0, 40)),
    );
    await expect(page.getByLabel('Name')).toHaveValue(/Brian Faker/);
    await expect(page.getByLabel('Emails')).toHaveValue(/brian\.faker@gmail\.com/i);
    await expect(page.getByLabel('Phone Numbers')).toHaveValue(/\+43/);
    await expect(page.getByLabel('Addresses')).toHaveValue(/Domgasse/i);
    await expect(page.getByLabel('Title').first()).toHaveValue(new RegExp(experienceTitle, 'i'));
    await expect(page.getByLabel('Company').first()).toHaveValue(new RegExp(companyName, 'i'));
    await expect(page.getByLabel('Skills')).toHaveValue(new RegExp(skillExample));
    await expect(page.getByLabel('Institution').first()).toHaveValue(
      new RegExp(educationInstitution, 'i'),
    );
    await expect(page.getByLabel('Degree').first()).toHaveValue(new RegExp(educationDegree, 'i'));
  });
});
