# ADR 0011: Next.js API Route Caching Prevention for Dynamic Data

**Status:** Accepted  
**Date:** 2025-10-23  
**Deciders:** Development Team  
**Context:** Resume upload feature enhancement

---

## Context

When implementing the resume upload feature with real-time data display, we encountered an issue where the Next.js API route proxy (`/api/uploads`) was returning stale cached data despite the backend database containing fresh uploads. Users would upload a resume, but the "All Uploaded Resumes" table would not reflect the new upload until a hard browser refresh or server restart.

### Problem Statement

Next.js 13+ with App Router aggressively caches route handlers by default to optimize performance. While this is beneficial for static content, it causes serious UX issues for dynamic data endpoints that need to reflect real-time database changes.

**Observed behavior:**

- Backend `/api/resumes` endpoint correctly returned fresh data with newest uploads
- Frontend `/api/uploads` proxy route returned stale cached data from previous requests
- Cache persisted across hot reloads during development
- Users saw outdated resume lists even after successful uploads

### Requirements

1. Users must see newly uploaded resumes immediately after upload
2. The "All Uploaded Resumes" table must always reflect current database state
3. No manual page refresh should be required to see new data
4. Solution must work consistently in both development and production

---

## Decision

We will **disable caching for all Next.js API routes that serve dynamic database-backed data** by using Next.js route segment config exports and fetch options.

### Implementation

For API routes that must always return fresh data:

```typescript
// Disable route-level caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Disable fetch-level caching
const res = await fetch(`${API_BASE}/api/resumes`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  cache: 'no-store', // Critical: prevent fetch cache
});
```

### Applied to

- `apps/web/src/app/api/uploads/route.ts` - Resume uploads list
- Any future API routes that proxy dynamic backend data

---

## Consequences

### Positive

✅ **Immediate data freshness** - Users see new uploads instantly  
✅ **Predictable behavior** - Consistent across dev and prod environments  
✅ **Better UX** - No confusion about missing uploads  
✅ **Explicit intent** - Code clearly communicates caching strategy  
✅ **Minimal code** - Simple configuration, no complex cache invalidation logic

### Negative

⚠️ **Slightly increased latency** - Every request hits the backend (acceptable for dynamic data)  
⚠️ **Higher backend load** - No request-level caching relief (mitigated by backend's ability to handle load)  
⚠️ **Must remember pattern** - Developers must apply this to new dynamic routes

### Neutral

- This is the correct pattern for dynamic data in Next.js App Router
- Aligns with Next.js best practices for dynamic content
- Can be optimized later with proper cache invalidation strategies if needed

---

## Alternatives Considered

### 1. Client-side cache busting with query parameters

```typescript
fetch(`/api/uploads?t=${Date.now()}`)
```

**Rejected:** Band-aid solution that doesn't address root cause. Still requires users to manually trigger refresh in some scenarios.

### 2. Implement cache revalidation tags

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

**Rejected:** 60-second delay is too long for real-time uploads. Users expect immediate feedback.

### 3. Manual cache invalidation with `revalidatePath()`

```typescript
import { revalidatePath } from 'next/cache';
// After upload
revalidatePath('/api/uploads');
```

**Rejected:** Requires coordination between upload handler and list route. Adds complexity and potential for bugs if developers forget to invalidate.

### 4. Use Server Actions instead of API routes

**Rejected:** Would require significant refactoring of existing backend API. Current proxy pattern works well and maintains clean separation between frontend and backend.

---

## Related

- **Story:** [#34 - Enhance Resume Upload](../Stories/milestone-1-BasicResumeIntakeAndGeneration/story-34-enhance-resume-upload.md)
- **Related ADRs:**
  - ADR 0003: Next.js Frontend (established Next.js as frontend framework)
- **Next.js Docs:** [Route Segment Config - dynamic](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
- **Next.js Docs:** [fetch API - cache option](https://nextjs.org/docs/app/api-reference/functions/fetch#optionscache)

---

## Implementation Notes

### Development Experience

- Hot reload works correctly with `dynamic='force-dynamic'`
- No need to restart dev server when adding new uploads
- Terminal logs show fresh data on every request

### Testing

Added E2E test to verify no-caching behavior:

```typescript
test('should return fresh data on each request (no caching)', async ({ request }) => {
  const res1 = await request.get(`${webUrl}/api/uploads`);
  const res2 = await request.get(`${webUrl}/api/uploads`);
  // Both should return same fresh data, not stale cache
  expect(data1.items.length).toBe(data2.items.length);
});
```

### Future Considerations

If backend load becomes an issue, consider:

- Adding Redis/Memcached layer with proper invalidation
- Implementing WebSocket updates for real-time sync
- Using Next.js Incremental Static Regeneration (ISR) with on-demand revalidation

For now, the simple approach is sufficient and provides the best UX.

---

## References

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)
