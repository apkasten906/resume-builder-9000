# AI Guidance: Preventing Hardcoded Test Data

- **Copilot and AI tools must never generate hardcoded test/mock data in production components.**
  - Always use environment flags, dependency injection, or test-only mocks for any test data.
  - If you are generating code for E2E or integration tests, place mock data in test-only files or behind `process.env.NODE_ENV === 'test'` guards.
  - If you are unsure, ask for clarification or generate a warning comment in the code.

- **Custom Lint Rule Enforcement:**
  - A custom ESLint rule (`no-hardcoded-test-data`) is required in this repository.
  - This rule will flag suspicious hardcoded arrays or objects (e.g., skills, requirements, mock responses) in production code.
  - All AI-generated code must pass this lint rule before being committed.

## Implementation Patterns

## Testability and Mock Data

- **Never hardcode test data in production components.**
  - Hardcoded data can leak into production, cause confusion, and create false positives in tests.
  - Use environment variables, feature flags, or dependency injection to provide mock data only in test environments.
  - Prefer separate test components, test setup files, or test-specific mocks for E2E and integration tests.
  - If you must include test logic, always guard it with a clear environment check (e.g., `if (process.env.NODE_ENV === 'test')`).

- **Pattern (using environment flag):**

  ```typescript
  const isTest = process.env.NODE_ENV === 'test';
  const [parsedRequirements] = useState<string[]>(
    isTest ? ['Requirements: Degree, 3+ years experience, React'] : []
  );
  ```

- **Pattern (test-only mock component):**

  ```typescript
  // src/components/__mocks__/MockResumeUpload.tsx
  export const MockResumeUpload = () => {
    // Provide mock data and handlers for E2E tests only
  };
  ```

**Enforcement:**

- Code reviews and CI should reject hardcoded test data in production code.

## Interfaces

- **Purpose**:
  - Define contracts for services, repositories, and other components.
  - Ensure consistent implementation across different modules.

- **Pattern**:

  ```typescript
  interface ResumeService {
    generateResume(data: ResumeData): Promise<Resume>;
  }
  ```

## Services

- **Purpose**:
  - Encapsulate business logic.
  - Act as intermediaries between controllers and repositories.

- **Pattern**:

  ```typescript
  class ResumeServiceImpl implements ResumeService {
    async generateResume(data: ResumeData): Promise<Resume> {
      // Business logic here
    }
  }
  ```

## Repositories

- **Purpose**:
  - Abstract database operations.
  - Provide a clean API for data access.

- **Pattern**:

  ```typescript
  class ResumeRepository {
    async findById(id: string): Promise<Resume | null> {
      // Database query here
    }
  }
  ```

## Controllers

- **Purpose**:
  - Handle HTTP requests and responses.
  - Delegate business logic to services.

- **Pattern**:

  ```typescript
  app.get('/resume/:id', async (req, res) => {
    const resume = await resumeService.findById(req.params.id);
    res.json(resume);
  });
  ```

## Domain Models

- **Purpose**:
  - Represent core entities in the application.
  - Define relationships and validation rules.

- **Pattern**:

  ```typescript
  class Resume {
    id: string;
    name: string;
    experience: Experience[];
  }
  ```

## Future Enhancements

- **Interfaces**:
  - Introduce decorators for runtime validation.

- **Services**:
  - Implement caching for frequently accessed data.

- **Repositories**:
  - Add support for transactions.

- **Controllers**:
  - Use middleware for common tasks like authentication.

- **Domain Models**:
  - Integrate with a validation library like `class-validator`.
