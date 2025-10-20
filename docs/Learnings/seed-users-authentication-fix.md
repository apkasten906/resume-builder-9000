# Seed Users Authentication Fix

## Issue Date

October 16, 2025

## Problem

The test user created by `scripts/seed-users.js` could not authenticate successfully. Investigation revealed that the user record in the database was missing critical fields.

## Root Cause Analysis

The seed script had multiple critical issues:

1. **Missing `id` field**: The UUID primary key was not being set, resulting in `NULL` values
2. **Missing `created_at` timestamp**: Not explicitly set in the INSERT statement
3. **Inconsistent column specification**: Script relied on positional parameters without explicitly naming columns

### Database Verification Results

**Before Fix:**

```json
{
  "id": null,
  "email": "user@example.com",
  "name": "Test User",
  "email_confirmed": 1
}
```

**After Fix:**

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "email": "user@example.com",
  "password_hash": "$2b$10$...",
  "created_at": "2025-10-16 09:40:10",
  "name": "Test User",
  "email_confirmed": 1,
  "email_confirmed_at": "2025-10-16 09:40:10"
}
```

## Solution

Modified `scripts/seed-users.js` to:

1. **Generate a UUID for the test user** - Using a consistent test UUID: `00000000-0000-0000-0000-000000000001`
2. **Explicitly specify all column names** in INSERT statements
3. **Include all required fields**: `id`, `email`, `password_hash`, `name`, `created_at`, `email_confirmed`, `email_confirmed_at`

### Code Changes

```javascript
// Generate a UUID for the test user
const userId = '00000000-0000-0000-0000-000000000001';

let insert;
if (hasNameColumn && hasEmailConfirmedColumn) {
  insert = db.prepare(
    "INSERT INTO users (id, email, password_hash, name, created_at, email_confirmed, email_confirmed_at) VALUES (?, ?, ?, ?, datetime('now'), 1, datetime('now'))"
  );
  insert.run(userId, 'user@example.com', hashedPassword, 'Test User');
}
// ... additional fallback cases
```

## Verification

Password verification test confirmed successful authentication:

- ✅ User ID is properly set as UUID
- ✅ Password hash is correctly stored
- ✅ Email is marked as confirmed (`email_confirmed = 1`)
- ✅ All timestamps are populated
- ✅ Password comparison succeeds with `bcrypt.compare()`

## Test User Credentials

```
Email: user@example.com
Password: ValidPassword1!
User ID: 00000000-0000-0000-0000-000000000001
```

## Lessons Learned

1. **Always specify column names explicitly** in INSERT statements, especially when dealing with tables that may have varying schemas across environments
2. **Validate generated data** - The script should verify that all required fields are populated correctly
3. **Test authentication end-to-end** - Don't just check if records exist; verify the complete authentication flow
4. **Use consistent test UUIDs** - Makes debugging and testing more predictable

## Related Files

- `scripts/seed-users.js` - Fixed seed script
- `packages/api/src/services/authService.ts` - Authentication service that validates credentials
- `docs/db migrations/0003_users_table.sql` - Users table schema definition

## Impact

This fix ensures that:

- Local development authentication works correctly
- E2E tests that depend on the test user can authenticate successfully
- Database seeding is consistent and reliable across environments
