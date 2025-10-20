# Email Verification Testing - Quick Start

## TL;DR

**For testing registration/verification (most common):**

```powershell
.\scripts\test-email-verification.ps1 -UseTestEndpoint
```

**For re-verification of already verified accounts:**

```powershell
.\scripts\test-email-verification.ps1 -Password "YourPassword"
```

## What Was Fixed

### Issue 1: Environment Variables Not Loading

- ✅ **FIXED**: Script now automatically loads `.env` from repository root
- ✅ TEST_ROUTE_SECRET is now accessible without manual export
- ✅ Works seamlessly with PowerShell

### Issue 2: Default Method Requires Verified Account

- ✅ **FIXED**: Documented that authenticated method only works with verified accounts
- ✅ Added clear error message directing to `-UseTestEndpoint` flag
- ✅ Reordered documentation to recommend test endpoint first

## Two Testing Methods

### Method 1: Test Endpoint (Recommended for Testing)

**Use when:**

- Testing initial registration flow
- Account is not yet verified
- Running E2E tests
- You don't want to type password

**Command:**

```powershell
.\scripts\test-email-verification.ps1 -UseTestEndpoint
```

**How it works:**

1. Loads TEST_ROUTE_SECRET from `.env` file automatically
2. Calls `/auth/resend-verification` to generate token
3. Fetches token from `/__test/emails` endpoint
4. Opens browser to verification URL

**Requirements:**

- TEST_ROUTE_SECRET set in `.env` file (✅ already configured)
- API server running on port 4000

---

### Method 2: Authenticated Endpoint (For Verified Accounts)

**Use when:**

- Testing re-verification of already verified accounts
- Want to use more secure method
- Don't want to rely on TEST_ROUTE_SECRET

**Command:**

```powershell
# Will prompt for password
.\scripts\test-email-verification.ps1

# Or provide password inline (less secure but faster for testing)
.\scripts\test-email-verification.ps1 -Password "YourPassword123!"
```

**How it works:**

1. Logs in with email/password (gets JWT token)
2. Calls `/auth/resend-verification` to generate token
3. Fetches token from `/auth/verification-token` endpoint (authenticated)
4. Opens browser to verification URL

**Requirements:**

- Account must already exist
- **Account must already be verified** (can't login with unverified account)
- API server running on port 4000

**Limitation:**
If you try this with an unverified account, you'll get:

```powershell
ERROR: Login failed
Your account exists but is not verified yet - this is expected!
The authenticated endpoint requires a verified account to login.

For unverified accounts, use the test endpoint method:
  .\scripts\test-email-verification.ps1 -UseTestEndpoint
```

## Common Scenarios

### Scenario 1: Just Registered, Want to Verify

```powershell
# After registration
.\scripts\test-email-verification.ps1 -UseTestEndpoint
```

### Scenario 2: Already Verified, Testing Re-Verification

```powershell
.\scripts\test-email-verification.ps1 -Password "YourPassword"
```

### Scenario 3: Different Email Address

```powershell
# Unverified account
.\scripts\test-email-verification.ps1 -Email "test@example.com" -UseTestEndpoint

# Verified account
.\scripts\test-email-verification.ps1 -Email "test@example.com" -Password "TestPassword123!"
```

### Scenario 4: Custom API/Web URLs

```powershell
.\scripts\test-email-verification.ps1 `
  -UseTestEndpoint `
  -ApiUrl "http://localhost:4000" `
  -WebUrl "http://localhost:3000"
```

## Troubleshooting

### "TEST_ROUTE_SECRET environment variable not set"

- ✅ **FIXED**: Script now auto-loads from `.env` file
- If still seeing this, check that `.env` exists in repository root with:

  ```bash
  TEST_ROUTE_SECRET=IPvfKSyfZOzJ1dnFNWAIOeHQCLUVrZEEutf1Y+ZLmhY=
  ```

### "Login failed" with 403 error

- This means your account is not verified yet
- **Solution**: Use `-UseTestEndpoint` flag instead

### "No verification email found"

- Token may have expired (30 min timeout)
- **Solution**: Script auto-generates new token, try running again

### "User not found"

- Account doesn't exist in database
- **Solution**: Register first at http://localhost:3000/register

## What Happens After Running Script?

1. 🌐 Browser opens to `http://localhost:3000/confirm-email?token=XXX`
2. ⏳ Page automatically verifies the token
3. ✅ Success message: "We confirmed your account. You can sign in right away."
4. 🔐 Click "Go to login" to sign in

## File Locations

- Script: `scripts/test-email-verification.ps1`
- Environment: `.env` (repository root)
- Email outbox: `.tmp/email-outbox.json` (created automatically)
- Documentation: `docs/email-verification-testing.md` (detailed guide)
