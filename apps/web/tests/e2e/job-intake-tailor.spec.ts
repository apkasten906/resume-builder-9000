import { expect, testWithAuth } from './test-setup';
import { testLogger } from './utils/test-logger';
import fs from 'fs';

const WEB_BASE = process.env['WEB_BASE'] || 'http://localhost:3000';

// Job Description Intake and Tailoring
  testWithAuth('should intake job description and show parsed requirements', async ({ page, authToken }) => {
    // Navigate to the job intake page
    testLogger.log('Navigating to job intake page');
    await page.goto(`${WEB_BASE}/job-intake`, { waitUntil: 'networkidle' });
    
    // Take a screenshot of the job intake page
    await fs.promises.mkdir('test-results', { recursive: true });
    await page.screenshot({ path: 'test-results/job-intake-page.png', fullPage: true });
    
    // Sample job description with requirements
    const jobDescription = `
      Senior Software Engineer
      
      Requirements:
      - 5+ years of experience with JavaScript
      - Experience with React and Next.js
      - Strong knowledge of TypeScript
      - Experience with API development
      - Good communication skills
      
      Responsibilities:
      - Develop new features
      - Maintain existing codebase
      - Collaborate with product managers
      - Write unit tests
    `;
    
    // Fill the job description field
    await page.locator('textarea[name="jobDescription"]').fill(jobDescription);
    
    // Click the parse button
    await page.getByRole('button', { name: /parse|analyze|extract/i }).click();
    
    // Wait for the parsed requirements to appear
    await page.waitForSelector('text=Requirements', { timeout: 10000 });
    
    // Verify the parsed requirements contain expected keywords
    const requirementsSection = await page.locator('.requirements-section').textContent();
    expect(requirementsSection).toContain('JavaScript');
    expect(requirementsSection).toContain('React');
    expect(requirementsSection).toContain('TypeScript');
    
    // Take a screenshot of the parsed requirements
    await page.screenshot({ path: 'test-results/parsed-requirements.png', fullPage: true });
    
    testLogger.log('Successfully parsed job description and extracted requirements');
  });

  testWithAuth('should run tailoring and generate ATS-safe output', async ({ page, authToken }) => {
    // Navigate to the job tailor page
    testLogger.log('Navigating to job tailor page');
    await page.goto(`${WEB_BASE}/job-tailor`, { waitUntil: 'networkidle' });
    
    // First, we need to select a resume to tailor
    // Select a resume from the dropdown
    await page.locator('select[name="resumeId"]').selectOption({ index: 0 });
    
    // Select a job description/posting to tailor for
    await page.locator('select[name="jobId"]').selectOption({ index: 0 });
    
    // Click the tailor button
    await page.getByRole('button', { name: /tailor|customize|optimize/i }).click();
    
    // Wait for the tailoring process to complete
    await page.waitForSelector('text=Tailored Resume', { timeout: 20000 });
    
    // Verify the tailored resume contains ATS-friendly elements
    const tailoredContent = await page.locator('#tailored-content').textContent();
    expect(tailoredContent).toBeTruthy();
    
    // Check for ATS optimization indicators
    const atsScore = await page.locator('.ats-score').textContent();
    expect(atsScore).toBeTruthy();
    
    // Take a screenshot of the tailored resume
    await page.screenshot({ path: 'test-results/tailored-resume.png', fullPage: true });
    
    // Verify download options are available
    const downloadButton = await page.getByRole('button', { name: /download|export|save/i });
    expect(downloadButton).toBeVisible();
    
    testLogger.log('Successfully tailored resume and generated ATS-safe output');
  });
