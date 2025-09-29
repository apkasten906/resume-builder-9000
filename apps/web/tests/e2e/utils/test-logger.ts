// apps/web/tests/e2e/utils/test-logger.ts
import { Page } from '@playwright/test';

/**
 * Controls verbosity of console logging in Playwright tests
 * 
 * Usage:
 * - Set PLAYWRIGHT_VERBOSE=true to enable all logging
 * - Set PLAYWRIGHT_VERBOSE=false or leave unset to show only warnings and errors
 * 
 * Examples:
 * ```
 * // Windows PowerShell
 * $env:PLAYWRIGHT_VERBOSE="true"; npx playwright test
 * 
 * // Windows Command Prompt
 * set PLAYWRIGHT_VERBOSE=true && npx playwright test
 * 
 * // Linux/macOS
 * PLAYWRIGHT_VERBOSE=true npx playwright test
 * ```
 */
export const testLogger = {
  isVerbose: process.env.PLAYWRIGHT_VERBOSE === 'true',

  /**
   * Log a message if verbose mode is enabled
   */
  log(...args: unknown[]): void {
    if (this.isVerbose) {
      console.log(...args);
    }
  },

  /**
   * Log a warning (always shown)
   */
  warn(...args: unknown[]): void {
    console.warn(...args);
  },

  /**
   * Log an error (always shown)
   */
  error(...args: unknown[]): void {
    console.error(...args);
  },

  /**
   * Enable verbose logging
   */
  enableVerbose(): void {
    this.isVerbose = true;
  },

  /**
   * Disable verbose logging
   */
  disableVerbose(): void {
    this.isVerbose = false;
  },

  /**
   * Debug the page state - logs URL, title, and authentication status
   */
  async debugPageState(page: Page, note: string): Promise<void> {
    if (!this.isVerbose) return;

    console.log(`Debug (${note}):`);
    console.log(`- Current URL: ${page.url()}`);
    console.log(`- Page title: ${await page.title()}`);
    
    // Check for authentication indicators
    const sessionCookie = await page.context()
      .cookies()
      .then(cookies => cookies.find(cookie => cookie.name === 'session'));
    
    console.log(`- Authentication indicators: ${sessionCookie ? 'Found' : 'Not found'}`);
    
    // Take a screenshot if debug directory exists
    try {
      await page.screenshot({ path: `./test-results/debug-${Date.now()}.png` });
    } catch {
      // Ignore screenshot errors
    }
  },
};

/**
 * Enable verbose logging for testing
 */
export function enablePlaywrightVerboseLogging(): void {
  testLogger.enableVerbose();
}

/**
 * Disable verbose logging for testing
 */
export function disablePlaywrightVerboseLogging(): void {
  testLogger.disableVerbose();
}