# Architectural Pattern Examples

## Example 1: Service Layer Pattern

### Overview: Service Layer

The service layer pattern encapsulates business logic and provides a clear API for the application. This ensures that the business logic is decoupled from controllers and repositories.

### Implementation: Service Layer

```typescript
// Service Interface
type ResumeService = {
  generateResume(data: ResumeData): Promise<Resume>;
};

// Service Implementation
class ResumeServiceImpl implements ResumeService {
  async generateResume(data: ResumeData): Promise<Resume> {
    // Business logic for generating a resume
    return {
      id: '1',
      name: data.name,
      experience: data.experience,
    };
  }
}

// Usage
const resumeService: ResumeService = new ResumeServiceImpl();
const resume = await resumeService.generateResume({ name: 'John Doe', experience: [] });
```

---

## Example 2: Repository Pattern

### Overview: Repository

The repository pattern abstracts database operations and provides a clean API for data access. This ensures that data access logic is decoupled from business logic.

### Implementation: Repository

```typescript
// Repository Class
class ResumeRepository {
  async findById(id: string): Promise<Resume | null> {
    // Simulate database query
    return { id, name: 'John Doe', experience: [] };
  }
}

// Usage
const resumeRepository = new ResumeRepository();
const resume = await resumeRepository.findById('1');
```

---

## Example 3: Controller Pattern

### Overview: Controller

The controller pattern handles HTTP requests and responses. This ensures that request handling logic is decoupled from business logic.

### Implementation: Controller

```typescript
// Controller
app.get('/resume/:id', async (req, res) => {
  const resume = await resumeService.findById(req.params.id);
  res.json(resume);
});
```

---

## Example 4: Validation with Zod

### Overview: Validation

The `zod` library is used for schema validation. This ensures that data passed to the application meets the required structure and constraints.

### Implementation: Validation

```typescript
import { z } from 'zod';

const ResumeSchema = z.object({
  name: z.string(),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      years: z.number(),
    })
  ),
});

const data = { name: 'John Doe', experience: [] };
const parsedData = ResumeSchema.parse(data);
```

---

## Example 5: Middleware for Authentication

### Overview: Middleware

Middleware handles cross-cutting concerns like authentication. This ensures that authentication logic is decoupled from business logic.

### Implementation: Middleware

```typescript
// Middleware
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

---

## Future Enhancements

- Add examples for advanced patterns like event sourcing and CQRS.
- Include examples for integrating third-party libraries and APIs.
