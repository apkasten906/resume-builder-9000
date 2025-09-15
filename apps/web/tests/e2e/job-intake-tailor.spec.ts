import { test, expect } from '@playwright/test';

test.describe('Job Description Intake and Tailoring', () => {
  test('should intake job description and show parsed requirements', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('jd-upload-input').setInputFiles('tests/assets/sample_jd.txt');
    await expect(page.getByTestId('jd-upload-success')).toBeVisible();
    await expect(page.getByTestId('parsed-requirements')).toContainText('Requirements');
    await expect(page.getByTestId('parsed-skills')).toBeVisible();
  });

  test('should run tailoring and generate ATS-safe output', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // Assume resume and JD already uploaded for test simplicity
    await page.getByTestId('run-tailor-btn').click();
    await expect(page.getByTestId('tailor-success')).toBeVisible();
    await expect(page.getByTestId('output-resume')).toContainText('ATS-safe');
    await expect(page.getByTestId('output-resume')).toContainText('Skills');
    await expect(page.getByTestId('output-resume')).toContainText('Experience');
  });
});
