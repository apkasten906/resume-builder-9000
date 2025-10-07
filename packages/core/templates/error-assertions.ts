// error-assertions.ts
/**
 * Utility for asserting error types/messages in integration/e2e tests
 * Improves negative test coverage and error handling consistency
 */
export async function assertErrorType(fn: () => Promise<any>, expectedType: string): Promise<void> {
  try {
    await fn();
    throw new Error('Expected error was not thrown');
  } catch (err: any) {
    if (!err || typeof err !== 'object') {
      throw new Error('Thrown value is not an error object');
    }
    // Example: Check error name/type
    if (err.name && err.name !== expectedType) {
      throw new Error(`Expected error type '${expectedType}', got '${err.name}'`);
    }
    // Example: Check error message pattern
    if (err.message && !err.message.includes(expectedType)) {
      throw new Error(
        `Error message does not include expected type '${expectedType}': ${err.message}`
      );
    }
    // If error matches, test passes
  }
}
