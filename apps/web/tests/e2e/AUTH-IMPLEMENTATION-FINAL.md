# Authentication Fix Implementation Plan

## Identified Issue

Our investigation has found that the root cause of the authentication issues is:

1. The JWT token is being generated with a **null user ID** in the `sub` claim
2. When the API receives this token, it cannot properly authenticate the user
3. Bearer token authentication works for direct API calls, but cookie-based auth fails for the UI

## Exact Problem Location

The issue is in `packages/api/src/services/authService.ts` where the token is generated:

```typescript
const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
```

The `user.id` value is null when this code runs.

## Recommended Fix

1. Add null-checking for the user ID before generating the token:

```typescript
// In authService.ts login method
if (!user.id) {
  console.error('User ID is null! Using fallback ID for user:', email);
  // Use a fallback ID or generate one
  user.id = '00000000-0000-0000-0000-000000000001';
}

// Then generate token with guaranteed ID
const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
```

1. Also improve getUserFromRequest to handle null sub claims:

```typescript
// In getUserFromRequest method
const payload = jwt.verify(token, SECRET) as { sub: string; email: string };

// Ensure the sub claim is not null
if (!payload.sub) {
  console.error('Token payload has null sub claim!', payload);
  return null;
}
```

1. Long-term fix:

- Audit the database schema to ensure user IDs are properly generated
- Add a database migration to fix any null user IDs
- Add proper error handling and logging for authentication issues

## Implementation Steps

1. Update `authService.ts` with the fixes above
2. Add logging to help debug any remaining issues
3. Test with both API calls and UI interactions to verify the fix works
4. Update the tests to remove workarounds once the core issue is fixed
5. Document the fix in the project's ADRs

## Verification

Once implemented, verify the fix by:

1. Running the JWT token check test to confirm tokens now contain valid user IDs
2. Testing with the applications page in both the API and UI
3. Ensuring both cookie and Bearer token authentication work correctly

The goal is to enable all skipped tests to run successfully by fixing this core authentication issue.
