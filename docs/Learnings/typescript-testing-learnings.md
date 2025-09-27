# TypeScript Testing Learnings

## Overview

This document captures key learnings and best practices for writing effective TypeScript tests, particularly when working with mocking and module dependencies. These insights were gained while implementing unit tests for resume database operations in the Resume Builder 9000 project.

## Key Challenges

1. **TypeScript Error Handling in Tests**: Addressing TypeScript errors in test files without resorting to `@ts-nocheck` or similar suppression techniques.
2. **Module Mocking**: Properly mocking dependencies with correct typing.
3. **Dynamic Imports**: Managing module imports and mocks at runtime.
4. **Function Nesting**: Avoiding deep function nesting that violates ESLint rules.
5. **Type Safety**: Maintaining type safety throughout tests while using mocks.

## Best Practices

### 1. Create Type-Safe Mock Interfaces

Instead of using `as unknown as` type assertions, define explicit interfaces for mocks:

```typescript
// Define interfaces for mocks that match the structure you need
interface MockDatabase {
  prepare: MockInstance;
  exec: MockInstance;
}

// Use the interface in your mocks
const mockDb: MockDatabase = {
  prepare: vi.fn(),
  exec: vi.fn(),
};
```

### 2. Extract Helper Functions for Mock Creation

Extract nested mock implementations to reduce nesting depth and improve readability:

```typescript
// Bad: Deep nesting
vi.doMock('better-sqlite3', () => ({
  default: vi.fn().mockImplementation(() => {
    throw new Error('Database error');
  }),
}));

// Good: Extract to helper function
function createErrorThrowingFn(errorMessage: string) {
  return () => {
    throw new Error(errorMessage);
  };
}

// Use the helper
const errorThrowingFunction = createErrorThrowingFn('Database error');
const createErrorMock = () => ({
  default: vi.fn().mockImplementation(errorThrowingFunction),
});
```

### 3. Use ES Module Dynamic Imports in Tests

Replace CommonJS `require()` calls with ES Module dynamic imports:

```typescript
// Bad: CommonJS require in ESM context
const { myFunction } = require('./my-module.js');

// Good: ES Module dynamic import
const module = await import('./my-module.js');
const { myFunction } = module;
```

This requires making the test function `async` but provides better TypeScript compatibility.

### 4. Properly Reset and Restore Module State

When using dynamic mocks, always reset module cache and restore original mocks:

```typescript
// Store original mock
const originalMock = vi.importActual('dependency');

// Apply temporary mock
vi.doMock('dependency', () => mockImplementation);
vi.resetModules();

// Import with the mock applied
const { testedFunction } = await import('./module-under-test');

// Run test...

// Restore original mock
vi.doMock('dependency', () => originalMock);
vi.resetModules();
```

### 5. Create Type-Safe Test Fixtures

Create helper functions that return properly typed test data:

```typescript
// Define helper functions that return typed data
function createMockResumeData(): ResumeData {
  return {
    personalInfo: {
      fullName: 'Test User',
      email: 'test@example.com',
    },
    summary: 'Test summary',
    experience: [],
    education: [],
  };
}

// Use in tests
const testData = {
  content: 'Base64EncodedContent',
  resumeData: createMockResumeData(),
  jobDetails: createMockJobDetails(),
  createdAt: new Date().toISOString(),
};
```

## Common Pitfalls

1. **Over-Reliance on Type Assertions**: Avoid excessive use of `as` or `as unknown as` type assertions which bypass TypeScript's type checking.

2. **Using `@ts-nocheck` or `// @ts-ignore`**: These should be used very sparingly, if at all. They hide potential issues rather than solving them.

3. **Inconsistent Mocking Approaches**: Mixing different mocking strategies within the same test suite leads to confusion and maintenance difficulties.

4. **Importing Mocked Modules Before Applying Mocks**: Make sure to reset modules and re-import after applying mocks, otherwise the original module might be used.

5. **Deep Function Nesting**: Nesting functions more than 4 levels deep creates code that's hard to read and maintain.

## Solutions for Specific Issues

### Handling ESLint `no-var-requires` Rule

When you must use `require()`, add a specific ESLint exception:

```typescript
// eslint-disable-next-line @typescript-eslint/no-var-requires
const module = require('./module');
```

However, prefer using dynamic imports when possible.

### Dealing with "Functions Nested Too Deeply" Warning

1. Extract inner functions to module scope
2. Use helper functions
3. Break complex tests into multiple simpler tests

### Module Re-Import Issues

When a module needs to be re-imported with different mocks, follow this pattern:

```typescript
// Initial setup
vi.doMock('dependency', mockImplementationA);
vi.resetModules();
const moduleA = await import('./module');

// Change the mock
vi.doMock('dependency', mockImplementationB);
vi.resetModules();
const moduleB = await import('./module');

// Clean up
vi.resetModules();
vi.clearAllMocks();
```

## Conclusion

Writing TypeScript-friendly tests requires careful attention to typing, module management, and code organization. By following these best practices, we can maintain type safety throughout our test suite while still effectively mocking dependencies and testing edge cases.

The effort to properly type tests and mocks pays dividends in maintainability, readability, and reliability of the test suite over time.
