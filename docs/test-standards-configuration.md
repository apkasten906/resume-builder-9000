# Test Standards Enforcement Configuration

This document outlines how to configure and use the test standards enforcement system.

## ESLint Rules Configuration

Add the following rules to your `.eslintrc.js` or `eslint.config.js`:

```javascript
module.exports = {
  // ... other config
  rules: {
    // Enforce testLogger usage in test files
    'local-rules/require-test-logger': 'error',

    // Enforce explicit typing in test files
    'local-rules/require-explicit-test-types': 'warn',

    // Prevent console.log in test files (existing rule)
    'no-console': ['error', { allow: ['warn', 'error'] }],

    // Prevent hardcoded test data (existing rule)
    'local-rules/no-hardcoded-test-data': 'error',
  },

  // Override rules specifically for test files
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // Stricter rules for test files
        'local-rules/require-test-logger': 'error',
        'local-rules/require-explicit-test-types': 'error',

        // Allow console.warn/error for debugging in tests if needed
        'no-console': ['error', { allow: ['warn', 'error'] }],
      },
    },
    {
      files: ['**/*.template.ts'],
      rules: {
        // Disable rules for template files
        'local-rules/require-test-logger': 'off',
        'local-rules/require-explicit-test-types': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
```

## Environment Variables for testLogger

Control testLogger behavior with these environment variables:

```bash
# Enable console output in tests (default: false in production, true in development)
TEST_LOG_CONSOLE=true

# Enable file logging for tests (default: false)
TEST_LOG_FILE=true

# Set log level (debug, info, warn, error - default: info)
TEST_LOG_LEVEL=debug

# Enable Playwright specific logging
PLAYWRIGHT_TEST=true
```

## Usage Examples

### Using testLogger in Tests

```typescript
import { testLogger } from '@rb9k/core/testLogger';
import type { TestData } from '../src/types.js';

describe('My Test Suite', () => {
  const logger = testLogger.child('MyTestSuite');

  it('should work correctly', async () => {
    // ✅ Good - Using testLogger with explicit typing
    const testData: TestData = { id: 1, name: 'test' };
    logger.info('Testing with data:', testData);

    const result: ResultType = await myFunction(testData);
    logger.debug('Received result:', result);

    expect(result).toBeDefined();
  });
});
```

### What Gets Flagged by ESLint

```typescript
// ❌ Bad - Will be flagged by require-test-logger rule
console.log('This will be flagged in test files');

// ❌ Bad - Will be flagged by require-explicit-test-types rule
let testData = { id: 1 }; // Missing type annotation for test variable

// ❌ Bad - Will be flagged by no-hardcoded-test-data rule
const mockSkills = ['JavaScript', 'TypeScript']; // Hardcoded test data
```

## Migration Guide

### Step 1: Install testLogger

The testLogger is already available in `@rb9k/core/testLogger`. Import it in your test files:

```typescript
import { testLogger } from '@rb9k/core/testLogger';
```

### Step 2: Replace console.log

Use ESLint's auto-fix feature:

```bash
# Auto-fix testLogger imports and replacements
npx eslint --fix "**/*.test.ts" "**/*.spec.ts"
```

### Step 3: Add Type Annotations

Add explicit types to test variables:

```typescript
// Before
let mockUser = { id: 1, name: 'John' };

// After
let mockUser: User = { id: 1, name: 'John' };
```

### Step 4: Use Templates

Copy from the templates directory:

- `packages/core/templates/unit-test.template.ts`
- `packages/core/templates/integration-test.template.ts`
- `packages/core/templates/e2e-test.template.ts`

## Benefits

1. **Structured Logging**: testLogger provides consistent, controllable logging
2. **Better Debugging**: Environment variable control over log levels and output
3. **Type Safety**: Explicit typing catches errors at compile time
4. **Consistency**: Standardized test patterns across the codebase
5. **Maintainability**: Clear test structure makes maintenance easier

## Troubleshooting

### ESLint Rule Not Working

1. Check that the rules are properly registered in `eslint-local-rules.cjs`
2. Verify the rule is enabled in your ESLint config
3. Ensure you're running ESLint on the correct file patterns

### testLogger Not Found

1. Check that `@rb9k/core` is built: `npm run build`
2. Verify the import path matches your workspace structure
3. Check if you need to add the testLogger export to `packages/core/src/index.ts`

### Template Files Causing Errors

Template files in `packages/core/templates/` should have ESLint rules disabled via overrides configuration.
