# Authentication Fix Implementation Plan

Based on our testing and diagnostic results, we need to implement several fixes to resolve the authentication issues in the application.

## Step 1: Fix User ID in JWT Token Generation

The primary issue is that the JWT token has a null `sub` claim, which means no user ID is being included in the token. This causes authentication to fail when API endpoints try to use that user ID.

### Implementation Tasks:

1. Locate the authentication service where tokens are generated
2. Debug the user lookup process to ensure the user ID is being retrieved correctly
3. Modify the token generation to include the user ID in the `sub` claim
4. Add error handling to prevent tokens with null user IDs

## Step 2: Fix Authentication Middleware

The authentication middleware needs to be updated to handle both cookie and Bearer token authentication consistently.

### Implementation Tasks:

1. Update the middleware to extract tokens from both cookies and Authorization headers
2. Add validation to ensure tokens have a valid user ID
3. Implement proper error handling for invalid or missing tokens
4. Add logging to help diagnose authentication failures

## Step 3: Update Test Setup

The test setup should be updated to use a more reliable authentication method.

### Implementation Tasks:

1. Update test-setup.ts to use Bearer token authentication for API requests
2. Implement a direct database access fallback for tests when auth fails
3. Add better error reporting when authentication fails in tests

## Step 4: Create a Fix PR

Once the changes are implemented and tested, create a PR with:

1. The authentication fixes
2. Updated tests that now pass
3. Documentation on the authentication flow

## Next Steps

1. First, identify the authentication service code that generates tokens
2. Then, modify the token generation to include the user ID
3. Test the changes to ensure they resolve the authentication issues
4. Update the tests to use the fixed authentication flow

This should address the root cause and allow the applications feature to work correctly.
