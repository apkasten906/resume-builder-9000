# Playwright Testing Guide

## Test Logging System

We've implemented a consistent logging system for Playwright E2E tests that offers the following benefits:

## Key Features

1. **Controlled Verbosity**: Tests can run in either verbose or quiet mode via environment variables
2. **Consistent Interface**: All test files use the same logging approach
3. **Debug Helpers**: Added functionality to inspect page state during troubleshooting

## Implementation Details

### Core Components

- `testLogger`: A utility to standardize logging across all Playwright tests
- Environment variable `PLAYWRIGHT_VERBOSE`: Controls log verbosity

### Logger Methods

- `testLogger.log()`: For informational messages (only shown in verbose mode)
- `testLogger.warn()`: For warnings (always shown)
- `testLogger.error()`: For errors (always shown)
- `testLogger.debugPageState()`: For capturing detailed page state information

## Usage Examples

### Basic Usage

```typescript
import { testLogger } from './utils/test-logger';

test('should perform action', async ({ page }) => {
  testLogger.log('Starting test operation'); // Only shown in verbose mode

  try {
    await page.click('button');
  } catch (error) {
    testLogger.error('Failed to click button', error); // Always shown
  }
});
```

### Enabling Verbose Mode

Run tests with verbose logging enabled:

```bash
# PowerShell
$env:PLAYWRIGHT_VERBOSE="true"; npx playwright test

# Bash
PLAYWRIGHT_VERBOSE=true npx playwright test
```

## Benefits

1. **Reduced Noise**: Normal test runs only show warnings and errors
2. **Detailed Debugging**: Verbose mode provides comprehensive information
3. **Consistent Format**: Standardized approach across all test files
4. **Improved Maintainability**: Easy to adjust logging behavior project-wide

## Files Modified

1. `apps/web/tests/e2e/test-setup.ts`: Updated to use testLogger
2. `apps/web/tests/e2e/standalone-login.spec.ts`: Replaced console.log with testLogger
3. `apps/web/tests/e2e/jwt-token-check.spec.ts`: Replaced console.log with testLogger
4. `apps/web/tests/e2e/utils/test-logger.ts`: Enhanced documentation

## Best Practices

- Use `testLogger.log()` for routine information that's useful during debugging
- Use `testLogger.warn()` for unexpected conditions that don't fail the test
- Use `testLogger.error()` for critical issues that may cause test failure
- Include the full error object when logging errors for stack traces
- Call `testLogger.debugPageState()` at key points in the test flow for troubleshooting
- Avoid using visual indicators like icons in log messages
- Ensure all log messages are meaningful and provide actionable insights

## Recent Updates

### Removal of Icons from Log Messages

- All log messages have been standardized to remove icons (e.g., ✅, ❌) for better readability and compatibility with CI/CD pipelines.
- Use `testLogger` methods for all logging needs to ensure consistency.

### Example Update

```typescript
// Before
console.log('✅ Test passed');

// After
import { testLogger } from './utils/test-logger';
testLogger.log('Test passed');
```

## Next Steps

- Consider adding additional helper methods to the testLogger for common debugging patterns
- Implement integration with CI/CD pipelines by setting the environment variable
- Standardize test failure screenshots with the logger system
