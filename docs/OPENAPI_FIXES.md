# OpenAPI and Swagger Documentation Fixes

This document addresses the review comments about OpenAPI documentation inconsistencies.

## Issues Identified

### 1. Duplicate Swagger Setup

**Issue**: Both swagger-jsdoc (swagger.ts) and zod-openapi (openapi.ts) are used
**Solution**: Standardize on zod-openapi to maintain single source of truth

### 2. OpenAPI Response Schema Mismatches

**Issue**: API documentation doesn't match actual endpoint responses
**Examples**:

- POST /api/resumes documented to return `{id, content, resumeData, jobDetails, createdAt}`
- Actual implementation returns `{summary, experience, skills}` for parsing

### 3. Route Duplication

**Issue**: Mounting full router at both `/api/resumes` and `/api/resumes/parse` creates ambiguous routes
**Solution**: Create specific endpoint for parsing or use route parameters

## Fixes Needed

### Remove Duplicate Swagger Setup

```typescript
// Remove packages/api/src/utils/swagger.ts
// Keep only packages/api/src/utils/openapi.ts
```

### Update OpenAPI Schema

```typescript
// In openapi.ts, update POST /api/resumes response schema:
post: {
  responses: {
    201: {
      description: 'Parsed resume data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              experience: {
                type: 'array',
                items: { type: 'string' }
              },
              skills: {
                type: 'array',
                items: { type: 'string' }
              },
            },
          },
        },
      },
    },
  },
}
```

### Fix Route Structure

```typescript
// Instead of mounting the same router twice:
app.use('/api/resumes', resumeRoutes);
app.use('/api/resumes/parse', resumeRoutes);

// Use specific routes:
app.use('/api/resumes', resumeRoutes);
app.post('/api/resumes/parse', parseHandler);
```

## Implementation Notes

These fixes ensure:

1. Single source of truth for API documentation
2. Consistent API contract between docs and implementation
3. Clear, unambiguous routing structure
4. Proper HTTP status codes (413 for oversized files)
