// Database cleanup utility for e2e tests
// Usage: Call dbCleanup after each test to remove test data and prevent database bloat.

import { testLogger } from './utils/test-logger';

interface TestContext {
  testId: string;
  [key: string]: unknown;
}

declare global {
  // eslint-disable-next-line no-var
  var db: {
    run(sql: string, params?: unknown[]): Promise<unknown>;
  };
}

/**
 * Cleans up test data from the database after each test.
 * @param tables Array of table names to clean
 * @param testContext Optional context for filtering test data
 */
export async function dbCleanup({
  tables = [],
  testContext,
}: {
  tables: string[];
  testContext?: TestContext;
}): Promise<void> {
  for (const table of tables) {
    try {
      // Example: Delete all rows created during the test
      // Replace with your actual DB logic
      if (testContext?.testId) {
        await global.db.run(`DELETE FROM ${table} WHERE test_id = ?`, [testContext.testId]);
      }
      testLogger.info(`Cleaned up test data from table: ${table}`);
    } catch (error) {
      testLogger.warn(`Failed to clean up table ${table}:`, error);
    }
  }
}
