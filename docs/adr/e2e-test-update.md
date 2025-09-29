# ADR Update: E2E Testing Best Practices

This patch extends ADR-0007 with additional specific guidance for E2E testing based on recent project experience.

## Add to "Best Practices" section

### End-to-End Test Reliability

1. **Environment Setup**
   - Always explicitly set environment variables (`NODE_ENV=test`) when running tests that depend on test-specific endpoints.
   - Verify both frontend and backend services are running with correct environment configuration.

2. **Resilient Test Design**
   - Implement multiple fallback strategies for critical operations (authentication, data creation).
   - Add comprehensive logging and artifact collection (screenshots, HTML content) for debugging.
   - Use defensive programming techniques to handle variations in UI rendering and API responses.

3. **Element Selection**
   - Use multiple selector strategies (label, name, placeholder, etc.) with proper fallbacks.
   - Implement robust waiting mechanisms that account for UI rendering delays.
   - Add meaningful logging when elements can't be found to aid debugging.

4. **Authentication Handling**
   - Prefer direct API authentication when possible to avoid UI login flows.
   - Implement fallback authentication mechanisms when primary approaches fail.
   - Store and reuse authentication tokens within test suites for efficiency.

5. **Data Management**
   - Create test data at the beginning of each test through API calls rather than UI.
   - Clean up test data after test completion to maintain isolation.
   - Use unique identifiers for test data to prevent collisions between parallel test runs.

## Add to "Examples" section

### E2E Test Example

```typescript
// applications.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Applications functionality', () => {
  test('should create and list applications', async ({ page, request }) => {
    // Setup: Create application via API directly for efficiency
    const loginResponse = await request.post('/api/auth/login', {
      data: { email: 'test@example.com', password: 'password' },
    });
    const authData = await loginResponse.json();

    // Create test data via API
    await request.post('/api/applications', {
      headers: { Authorization: `Bearer ${authData.token}` },
      data: { company: 'Test Company', role: 'Developer' },
    });

    // Test UI interaction
    await page.goto('/applications');

    // Use resilient selectors with descriptive error messages
    try {
      await expect(page.getByText('Test Company')).toBeVisible();
    } catch (e) {
      // Take diagnostic screenshot and save page content
      await page.screenshot({ path: 'test-results/app-list-error.png' });
      throw e;
    }

    // Clean up
    await request.delete('/api/applications/test-company');
  });
});
```
