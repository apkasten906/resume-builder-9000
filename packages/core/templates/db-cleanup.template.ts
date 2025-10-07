// Database cleanup utility for test templates
// Usage: Call dbCleanup after each test to remove test data and prevent database bloat.

import { testLogger } from '@rb9k/core/testLogger';

interface TestContext {
  testId: string;
  [key: string]: any;
}

/**
 * Cleans up test data from the database after each test.
 * @param tables Array of table names to clean
 * @param testContext Optional context for filtering test data
 */
export async function dbCleanup({
  tables = [],
  testContext = {},
}: {
  tables: string[];
  testContext?: TestContext;
}) {
  for (const table of tables) {
    try {
      // Example: Delete all rows created during the test
      // Replace with your actual DB logic
      await global.db.run(`DELETE FROM ${table} WHERE test_id = ?`, [testContext.testId]);
      testLogger.info(`Cleaned up test data from table: ${table}`);
    } catch (error) {
      testLogger.warn(`Failed to clean up table ${table}:`, error);
    }
  }
}
