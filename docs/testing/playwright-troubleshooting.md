# Playwright Test Configuration and Troubleshooting

## Current Configuration

The Playwright tests are configured with the following settings:

- **Timeout**: 60000ms (60 seconds)
- **Retries**: 2
- **Workers**: 8 (default)
- **Reporter**: dot

## Authentication Strategy

The tests use a two-tiered authentication approach:

1. **API Login**: First attempt is via the `/auth/login` API endpoint
2. **UI Login Fallback**: If API login fails, fallback to UI-based login

### Credentials

Tests use the following hardcoded credentials:

- Email: `user@example.com`
- Password: `ValidPassword1!`

## Common Issues and Solutions

### 1. Authentication Failures

**Symptoms**:

- "Invalid credentials" error from API
- No session cookie after login attempt

**Solutions**:

- Check that the test user exists in the database
- Verify the user's password is correct
- Look for CORS issues preventing cookie setting
- Try clearing the session database table

### 2. Navigation Timeouts

**Symptoms**:

- "Navigation timeout exceeded" errors
- Flaky tests that sometimes pass

**Solutions**:

- Avoid `page.waitForNavigation()` - use element-based waiting instead
- Increase timeout values when needed
- Use `page.waitForLoadState('networkidle')` for stable pages
- Add explicit element selectors to wait for after navigation

### 3. Application Creation Issues

**Symptoms**:

- Tests add applications but they don't appear in the list
- Table elements are empty after adding items

**Solutions**:

- Check database connection in test environment
- Verify API endpoints for application CRUD operations
- Check if the frontend is refreshing data correctly
- Look for issues with state management in components

## Debugging Tips

1. **Add console logging**: Use `console.log()` in test files for better visibility
2. **Take screenshots**: Add `page.screenshot()` at critical points
3. **Check HTML content**: Use `page.content()` to see what's rendered
4. **Use trace viewer**: Run tests with `--trace on` for detailed debugging
5. **Examine network requests**: Use `page.route()` to monitor API calls

## Re-enabling Skipped Tests

When ready to re-enable skipped tests:

1. Remove the `.skip` modifier
2. Run the test in isolation with `npx playwright test filename.spec.ts`
3. Address any failures one by one
4. Add to CI once stable

## Best Practices

1. Use unique identifiers for created entities (timestamps, UUIDs)
2. Avoid fragile selectors like text content that might change
3. Add proper cleanup after tests run
4. Use data-testid attributes for stable selectors
5. Separate test concerns - test one thing per test file
