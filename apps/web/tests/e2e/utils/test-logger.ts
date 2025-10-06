// apps/web/tests/e2e/utils/test-logger.ts
/**
 * Backward compatibility wrapper for testLogger
 * Provides seamless integration with the new unified logging system
 * while maintaining existing API for test files
 */
import { Page } from '@playwright/test';
import { LoggerUtils, type UniversalLogger } from '@rb9k/core';

// Create a unified logger for test environment with proper configuration
const unifiedTestLogger = LoggerUtils.forTest('rb9k-web-e2e-tests');

/**
 * Controls verbosity of console logging in Playwright tests
 * Now enhanced with structured logging capabilities
 *
 * Usage:
 * - Set PLAYWRIGHT_VERBOSE=true to enable all logging
 * - Set TEST_LOG_ENABLE=true to enable structured logging output
 * - Use testLogger methods for consistent, structured test logging
 *
 * Examples:
 * ```
 * // Windows PowerShell
 * $env:PLAYWRIGHT_VERBOSE="true"; $env:TEST_LOG_ENABLE="true"; npx playwright test
 *
 * // Windows Command Prompt
 * set PLAYWRIGHT_VERBOSE=true && set TEST_LOG_ENABLE=true && npx playwright test
 *
 * // Linux/macOS
 * PLAYWRIGHT_VERBOSE=true TEST_LOG_ENABLE=true npx playwright test
 * ```
 */
/**
 * Enhanced test logger that combines backward compatibility with unified logging
 */
class EnhancedTestLogger {
  private isVerbose = process.env.PLAYWRIGHT_VERBOSE === 'true';
  private readonly unifiedLogger = unifiedTestLogger;

  /**
   * Log a message (enhanced with structured logging)
   */
  log(...args: unknown[]): void {
    const message = args[0] as string;
    const meta = args.slice(1);

    // Backward compatibility: console output in verbose mode
    if (this.isVerbose) {
      console.log(...args);
    }

    // Enhanced: structured logging
    this.unifiedLogger.info(message, { meta });
  }

  /**
   * Log an info message
   */
  info(...args: unknown[]): void {
    this.log(...args);
  }

  /**
   * Log a debug message
   */
  debug(...args: unknown[]): void {
    const message = args[0] as string;
    const meta = args.slice(1);

    if (this.isVerbose) {
      console.log('[DEBUG]', ...args);
    }

    this.unifiedLogger.debug(message, { meta });
  }

  /**
   * Log a warning (always shown + structured logging)
   */
  warn(...args: unknown[]): void {
    const message = args[0] as string;
    const meta = args.slice(1);

    console.warn(...args);
    this.unifiedLogger.warn(message, { meta });
  }

  /**
   * Log an error (always shown + structured logging)
   */
  error(...args: unknown[]): void {
    const message = args[0] as string;
    const errorObj = args.find(arg => arg instanceof Error) || undefined;
    const meta = args.slice(1);

    console.error(...args);
    this.unifiedLogger.error(message, errorObj, { meta });
  }

  /**
   * Enable verbose logging
   */
  enableVerbose(): void {
    this.isVerbose = true;
  }

  /**
   * Disable verbose logging
   */
  disableVerbose(): void {
    this.isVerbose = false;
  }

  /**
   * Create a child logger with test context
   */
  child(testName: string): UniversalLogger {
    return this.unifiedLogger.child({ testName });
  }

  /**
   * Debug the page state - enhanced with structured logging
   */
  async debugPageState(page: Page, note: string): Promise<void> {
    // Get authentication indicators
    const sessionCookie = await page
      .context()
      .cookies()
      .then(cookies => cookies.find(cookie => cookie.name === 'session'));

    const debugInfo = {
      note,
      url: page.url(),
      title: await page.title(),
      hasAuth: !!sessionCookie,
    };

    // Backward compatibility: console output in verbose mode
    if (this.isVerbose) {
      console.log(`Debug (${note}):`);
      console.log(`- Current URL: ${debugInfo.url}`);
      console.log(`- Page title: ${debugInfo.title}`);
      console.log(`- Authentication indicators: ${sessionCookie ? 'Found' : 'Not found'}`);
    }

    // Enhanced: structured logging
    this.unifiedLogger.debug('Page state debug', debugInfo);

    // Take a screenshot if debug directory exists
    try {
      const screenshotPath = `./test-results/debug-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath });

      if (this.isVerbose) {
        console.log(`- Screenshot saved: ${screenshotPath}`);
      }

      this.unifiedLogger.debug('Screenshot captured', { path: screenshotPath });
    } catch (error) {
      this.unifiedLogger.warn('Screenshot capture failed', { error });
    }
  }
}

// Create singleton instance
export const testLogger = new EnhancedTestLogger();

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
