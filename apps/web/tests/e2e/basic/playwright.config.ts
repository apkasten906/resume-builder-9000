import { defineConfig } from '@playwright/test';

// Define config for tests that can run without relying on authentication or API
export default defineConfig({
  // Basic configuration
  reporter: 'dot',
  workers: 1, // Use only one worker to avoid conflicts
  timeout: 30000,
  use: {
    // Configure screenshot options
    screenshot: 'only-on-failure',
    // Configure trace options
    trace: 'on-first-retry',
  },
  // Test pattern for stable tests that don't require database or authentication
  testMatch: 'apps/web/tests/e2e/basic/*.spec.ts',
});
