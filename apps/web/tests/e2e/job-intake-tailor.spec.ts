import { test } from '@playwright/test';

// Job Description Intake and Tailoring - skipped tests
// These tests are marked as skipped because the UI isn't ready yet
// Keep these as skipped until we have the UI implementation for job intake and tailoring
test.describe('Job Description Intake and Tailoring', () => {
  test.skip('should intake job description and show parsed requirements', async () => {
    // Test will be implemented when UI is ready
  });

  test.skip('should run tailoring and generate ATS-safe output', async () => {
    // Test will be implemented when UI is ready
  });
});