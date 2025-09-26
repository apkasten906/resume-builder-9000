/**
 * Utility functions to control logging during tests
 */

import { describe, test, beforeAll, afterAll } from 'vitest';
import { enableVerboseLogging, disableVerboseLogging } from '../../src/utils/logger.js';

/**
 * Enable verbose logging for tests
 */
export function enableTestLogging(): void {
  enableVerboseLogging();
}

/**
 * Disable verbose logging for tests
 */
export function disableTestLogging(): void {
  disableVerboseLogging();
}

/**
 * Run a test with verbose logging enabled
 *
 * @param testName - The name of the test
 * @param testFn - The test function
 */
export function testWithVerboseLogging(testName: string, testFn: () => void): void {
  test(testName, () => {
    enableVerboseLogging();
    try {
      testFn();
    } finally {
      disableVerboseLogging();
    }
  });
}

/**
 * Run a test suite with verbose logging enabled
 *
 * @param suiteName - The name of the test suite
 * @param suiteFn - The test suite function
 */
export function describeWithVerboseLogging(suiteName: string, suiteFn: () => void): void {
  describe(suiteName, () => {
    beforeAll(() => {
      enableVerboseLogging();
    });

    afterAll(() => {
      disableVerboseLogging();
    });

    suiteFn();
  });
}
