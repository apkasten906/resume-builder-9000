# Test File Templates

This directory contains standardized test templates for consistent test structure across the project.

## Templates Available

- `unit-test.template.ts` - Template for unit tests
- `integration-test.template.ts` - Template for integration tests
- `e2e-test.template.ts` - Template for end-to-end tests

## Usage

1. Copy the appropriate template to your test file location
2. Replace placeholder values with actual test implementation
3. Follow the established patterns for imports, setup, and assertions

## Standards Enforced

- All test files must use `testLogger` instead of `console.log`
- Explicit TypeScript typing required for test variables and helper functions
- Consistent test structure with clear Arrange/Act/Assert sections
- Proper cleanup and teardown patterns
- Database cleanup: Use `dbCleanup` in integration/e2e tests to remove test data after each test. Example:

```typescript
import { dbCleanup } from './db-cleanup.template';
afterEach(async () => {
  await dbCleanup({ tables: ['your_table_1', 'your_table_2'], testContext });
});
```
