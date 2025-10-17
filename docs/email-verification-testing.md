# Email Verification Testing Guide

This guide explains how to manually test the email verification flow in development.

## Overview

The email verification system has two ways to retrieve verification tokens for testing:

1. **Test Endpoint** (Easiest for unverified accounts) - Requires TEST_ROUTE_SECRET from .env
2. **Authenticated Endpoint** (For verified accounts only) - Secure, user-centric approach

## ⚠️ Important: Which Method Should You Use?

- **For testing initial registration/verification** → Use **Test Endpoint** (`-UseTestEndpoint`)
  - Works with unverified accounts
  - Doesn't require login
  - Script auto-loads TEST_ROUTE_SECRET from .env

- **For testing re-verification of already verified accounts** → Use **Authenticated Endpoint** (default)
  - Requires already verified account
  - More secure (uses authentication)
  - Automatically disabled in production

## Method 1: Test Endpoint (Easiest for Testing)

### Why This Method?

✅ **Works with unverified accounts** - Perfect for testing initial registration
✅ **No login required** - Just needs TEST_ROUTE_SECRET from .env
✅ **Script auto-loads** - Automatically reads .env file
✅ **E2E test compatible** - Same method used in automated tests

### Quick Start

```powershell
# Easiest way - script loads TEST_ROUTE_SECRET from .env automatically
.\scripts\test-email-verification.ps1 -UseTestEndpoint

# With custom email
.\scripts\test-email-verification.ps1 -Email "test@example.com" -UseTestEndpoint
```

## Method 2: Authenticated Endpoint (For Verified Accounts)

### Why This Method?

✅ **More secure** - Requires authentication, users can only access their own token
✅ **No secrets needed** - Works with just email/password
✅ **Production-safe** - Automatically disabled in production
✅ **User-centric** - Follows "you can only see your own data" principle

⚠️ **Limitation**: Only works with already-verified accounts (can't login with unverified account)

### Endpoint Details```http

GET /auth/verification-token
Authorization: Bearer <jwt-token>

````

**Response:**

```json
{
  "ok": true,
  "token": "abc123def456...",
  "expiresAt": "2025-10-17T14:30:00.000Z",
  "verificationUrl": "http://localhost:3000/confirm-email?token=abc123def456..."
}
````

**Security:**

- Only available in development/test (returns 404 in production)
- Requires authentication (401 if not logged in)
- Returns only the authenticated user's token
- Returns 404 if no pending verification token exists

### Using the Helper Script

The easiest way to test is with the provided script:

```powershell
# Will prompt for password
.\scripts\test-email-verification.ps1

# Or provide password inline
.\scripts\test-email-verification.ps1 -Password "YourPassword123!"

# Test with different email
.\scripts\test-email-verification.ps1 -Email "test@example.com" -Password "Password123!"
```

### Manual cURL Example

```bash
# 1. Login to get auth token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"apkasten@gmail.com","password":"your-password"}' \
  -c cookies.txt

# 2. Generate a new verification token
curl -X POST http://localhost:4000/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"apkasten@gmail.com"}' \
  -b cookies.txt

# 3. Get your verification token
curl -X GET http://localhost:4000/auth/verification-token \
  -b cookies.txt

# 4. Navigate to the verificationUrl in your browser
```

### PowerShell Example

```powershell
# Login
$loginBody = @{
    email = "apkasten@gmail.com"
    password = "YourPassword123!"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri "http://localhost:4000/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -SessionVariable 'session'

$token = ($loginResponse.Content | ConvertFrom-Json).token

# Resend verification
Invoke-RestMethod `
    -Uri "http://localhost:4000/auth/resend-verification" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"apkasten@gmail.com"}' `
    -WebSession $session

# Get verification token
$verificationData = Invoke-RestMethod `
    -Uri "http://localhost:4000/auth/verification-token" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"} `
    -WebSession $session

# Open in browser
Start-Process $verificationData.verificationUrl
```

## Method 2: Test Endpoint (Legacy)

This method uses the test-support endpoint that requires TEST_ROUTE_SECRET.

### Using the Helper Script

```powershell
# Use test endpoint method
.\scripts\test-email-verification.ps1 -UseTestEndpoint
```

### Manual Steps

```powershell
# 1. Resend verification
Invoke-RestMethod `
    -Uri "http://localhost:4000/auth/resend-verification" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"apkasten@gmail.com"}'

# 2. Get emails from test endpoint
$emails = Invoke-RestMethod `
    -Uri "http://localhost:4000/__test/emails" `
    -Headers @{"x-test-secret"=$env:TEST_ROUTE_SECRET}

# 3. Extract token
$token = ($emails | Where-Object { $_.metadata.type -eq 'email-verification' } | Select-Object -Last 1).metadata.token

# 4. Open verification URL
Start-Process "http://localhost:3000/confirm-email?token=$token"
```

## Complete Verification Flow

```
1. User registers → Creates unverified user in database
2. System generates verification token (30min expiry)
3. System "sends" email (stored in .tmp/email-outbox.json)
4. User gets token via:
   a) Authenticated endpoint (secure)
   b) Test endpoint (requires secret)
   c) Reading .tmp/email-outbox.json directly
5. User navigates to /confirm-email?token=XXX
6. Frontend calls /auth/verify-email?token=XXX
7. Backend validates token, marks user as verified
8. User can now login
```

## Security Design

### Why Tokens Aren't in API Responses by Default

When you call `/auth/register` or `/auth/resend-verification`, the response does **not** include the token. This is intentional:

1. **Defense in depth** - Even if session is compromised, attacker can't verify email
2. **Token delivery separation** - Tokens should be delivered via separate channel (email)
3. **Production consistency** - Development behavior matches production

### Why the Authenticated Endpoint is Safe

The `/auth/verification-token` endpoint is secure because:

1. **Authentication required** - Must prove you are who you say you are
2. **User isolation** - Can only get YOUR OWN token, not anyone else's
3. **Environment-gated** - Automatically disabled in production
4. **Limited exposure** - Returns only current pending token, not historical tokens

It's essentially saying: "You can already generate a new token via `/auth/resend-verification`, so letting you see your current token doesn't increase risk."

## Troubleshooting

### "No pending verification token found"

This means either:

- Your email is already verified
- No verification token has been generated yet
- The token expired

**Solution:** Call `/auth/resend-verification` first to generate a new token.

### "Authentication required"

You're not logged in.

**Solution:** Login first with `/auth/login` and include the session cookie or JWT token.

### "Not found" (in production)

The endpoint is disabled in production for security.

**Solution:** Use this endpoint only in development/test environments.

## Files Involved

- `packages/api/src/controllers/auth.ts` - `getVerificationToken()` controller
- `packages/api/src/services/authService.ts` - `getVerificationToken()` service
- `packages/api/src/routes/auth.ts` - Route definition
- `scripts/test-email-verification.ps1` - Automated testing helper
- `.tmp/email-outbox.json` - Email storage (development only)

## Best Practices

1. **Use the authenticated endpoint** for manual testing (more secure)
2. **Use the test endpoint** for E2E tests (doesn't require login)
3. **Never commit** `.tmp/email-outbox.json` (already in .gitignore)
4. **Rotate TEST_ROUTE_SECRET** if it's ever exposed
5. **Test expiration** by waiting 30+ minutes before using token
