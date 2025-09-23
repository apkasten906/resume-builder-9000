# Navigation and Environment Fix Patterns

This document provides fix patterns for the navigation and environment issues identified in the Copilot review.

## Navigation Link Fixes

### Issue: Broken /build Route

**Problem**: Navigation still includes a 'Create Resume' link to /build, but the page was refactored
**Location**: `apps/web/src/app/layout.tsx`

### Current Navigation Structure

```tsx
<li>
  <a href="/build" className="hover:underline">
    Create Resume
  </a>
</li>
<li>
  <a href="/resume-upload" className="hover:underline">
    Resume Upload
  </a>
</li>
```

### Fix Pattern

```tsx
// Option 1: Update existing link to point to new location
<li>
  <a href="/resume-upload" className="hover:underline">
    Create Resume
  </a>
</li>

// Option 2: Differentiate functionality
<li>
  <a href="/build" className="hover:underline">
    Build Resume
  </a>
</li>
<li>
  <a href="/resume-upload" className="hover:underline">
    Upload Resume
  </a>
</li>

// Option 3: Use Next.js Link component for better navigation
import Link from 'next/link';

<li>
  <Link href="/resume-upload" className="hover:underline">
    Create Resume
  </Link>
</li>
```

## Environment-Based Mock Response Issues

### Issue: Hardcoded Mock Responses

**Problem**: Production code contains hardcoded test data and environment-based mocks
**Files**:

- `apps/web/src/app/build/page.tsx`
- `packages/api/src/controllers/resume.ts`

### Current Problematic Pattern

```typescript
// BAD: Environment-based mock in production code
if (process.env.NODE_ENV !== 'production') {
  return res.status(201).json({
    summary: 'Summary: Experienced software engineer...',
    experience: ['Software Engineer at Acme Corp, 2018-2023'],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  });
}
```

### Better Patterns

#### Pattern 1: Feature Flag Approach

```typescript
// Environment variable specifically for testing
if (process.env.ENABLE_MOCK_RESPONSES === 'true') {
  return handleMockResponse(req, res);
}

// Separate mock handler
function handleMockResponse(req: Request, res: Response) {
  return res.status(201).json({
    summary: 'Mock: Experienced software engineer...',
    experience: ['Mock: Software Engineer at Test Corp'],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  });
}
```

#### Pattern 2: Dedicated Test Endpoint

```typescript
// Separate route for testing
app.post('/api/resumes/mock', handleMockResume);
app.post('/api/resumes', handleRealResume);

function handleMockResume(req: Request, res: Response) {
  // Mock logic isolated from production code
}
```

#### Pattern 3: Dependency Injection

```typescript
interface ResumeService {
  parseResume(file: Buffer): Promise<ParsedResume>;
}

class MockResumeService implements ResumeService {
  async parseResume(): Promise<ParsedResume> {
    return {
      summary: 'Mock summary',
      experience: ['Mock experience'],
      skills: ['Mock', 'Skills'],
    };
  }
}

class RealResumeService implements ResumeService {
  async parseResume(file: Buffer): Promise<ParsedResume> {
    // Real parsing logic
  }
}

// In controller
const resumeService =
  process.env.NODE_ENV === 'test' ? new MockResumeService() : new RealResumeService();
```

## Frontend Mock Data Fixes

### Issue: Hardcoded Test Data in Components

**Problem**: UI components contain hardcoded mock data

### Current Pattern

```tsx
const [parsedRequirements] = useState<string[]>([
  'Requirements: Degree, 3+ years experience, React',
]);
const [parsedSkills] = useState<string[]>(['React', 'TypeScript', 'Teamwork']);
```

### Better Patterns

#### Pattern 1: Environment-Based Data Provider

```tsx
// utils/mockData.ts
export const getMockData = () => {
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_UI === 'true') {
    return {
      requirements: ['Requirements: Degree, 3+ years experience, React'],
      skills: ['React', 'TypeScript', 'Teamwork'],
    };
  }
  return null;
};

// In component
const mockData = getMockData();
const [parsedRequirements] = useState<string[]>(mockData?.requirements || []);
```

#### Pattern 2: Development-Only Components

```tsx
// components/DevMockDataProvider.tsx
const DevMockDataProvider = ({ children }: { children: React.ReactNode }) => {
  if (process.env.NODE_ENV !== 'development') {
    return children;
  }

  return <MockDataContext.Provider value={mockData}>{children}</MockDataContext.Provider>;
};
```

## Implementation Priority

1. **High Priority**: Remove environment-based production logic
2. **Medium Priority**: Fix navigation links
3. **Low Priority**: Improve mock data patterns for development

These patterns ensure:

- Production code remains clean
- Test/development scenarios are supported
- Clear separation of concerns
- Easy maintenance and debugging
