import { Page } from '@playwright/test';
import { LoggerUtils } from '@rb9k/core';

// Create a logger specific for debug utilities
const debugLogger = LoggerUtils.forTest('rb9k-web-debug');

/**
 * Logs the state of the page for debugging purposes.
 * @param page - The Playwright page instance.
 * @param note - A note to include in the log for context.
 */
export async function debugPageState(page: Page, note: string): Promise<void> {
  debugLogger.info(`Debug (${note}):`);

  try {
    // Current URL
    const url = page.url();
    debugLogger.info(`- Current URL: ${url}`);

    // Page title
    const title = await page.title();
    debugLogger.info(`- Page title: ${title}`);

    // Take screenshot
    const screenshotPath = `./test-results/debug-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });
    debugLogger.debug('Screenshot captured', { path: screenshotPath });

    // Check for error messages
    const errorTexts = await page.getByText(/error/i).allTextContents();
    if (errorTexts.length > 0) {
      debugLogger.warn('Error messages found on page', { errors: errorTexts });
    }

    // Check for authentication state
    const authElements = await page.getByText(/log out/i).count();
    const hasAuth = authElements > 0;
    debugLogger.info(`- Authentication indicators: ${hasAuth ? 'Found' : 'Not found'}`, {
      hasAuth,
    });

    // Log structured debug info
    debugLogger.debug('Page state debug complete', {
      note,
      url,
      title,
      hasAuth,
      errorCount: errorTexts.length,
      screenshotPath,
    });
  } catch (error) {
    debugLogger.error('Error while debugging page state', error as Error, { note });
  }
}
