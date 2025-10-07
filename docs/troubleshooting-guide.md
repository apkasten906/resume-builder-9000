# Resume Builder 9000 - Troubleshooting Guide

## Authentication Issues

### Navigation Menu Visible When Not Logged In

**Symptoms**:

- Navigation menu appears on the left side for unauthenticated users
- Users can see protected navigation links without being logged in

**Diagnosis**:

```typescript
// Check AuthContext state
console.log('Auth state:', { authenticated, checking });

// Verify conditional rendering in AppShell
{authenticated && <Navigation />} // Should be present
```

**Resolution**:

1. Ensure `AuthContext` is properly initialized
2. Verify `AppShell.tsx` has conditional rendering: `{authenticated && <Navigation />}`
3. Check that authentication state is correctly propagated

### Infinite API Requests / Performance Issues

**Symptoms**:

- Browser becomes slow and unresponsive
- Network tab shows thousands of identical API requests
- High CPU usage during page load

**Diagnosis**:

```typescript
// Add logging to useEffect to see when it triggers
useEffect(() => {
  console.log('Effect triggered', { authenticated, deps });
  // ... effect logic
}, [authenticated, other, deps]);
```

**Common Causes**:

1. **Circular useEffect dependencies**: Including state variables that are updated within the effect
2. **Missing dependency arrays**: Effects without dependencies run on every render
3. **State updates in render**: Updating state during component render

**Resolution**:

```typescript
// ❌ BAD: Creates infinite loop
useEffect(() => {
  setMyState(newValue);
}, [myState]);

// ✅ GOOD: Only external dependencies
useEffect(() => {
  fetchData().then(setMyState);
}, [externalDependency]);
```

### Login/Logout Redirect Issues

**Symptoms**:

- Login redirects to wrong page
- Logout doesn't redirect anywhere
- Users stay on protected pages after logout

**Diagnosis**:

```typescript
// Check login API route
console.log('Login redirect URL:', redirectUrl);

// Check logout implementation
console.log('Logout called, should redirect to home');
```

**Resolution**:

1. Verify login API redirects to home page (`/`) not `/applications`
2. Ensure logout function includes redirect logic
3. Check that cookies are properly cleared on logout

### Session/Cookie Problems

**Symptoms**:

- User appears logged out after page refresh
- Authentication state inconsistent
- "Unauthorized" errors for authenticated users

**Diagnosis**:

```javascript
// Check cookies in browser console
document.cookie;

// Check session cookie specifically
document.cookie.split(';').find(c => c.trim().startsWith('session='));
```

**Resolution**:

1. Verify session cookie is being set with correct domain/path
2. Check cookie expiration times
3. Ensure logout properly clears cookies
4. Verify API routes handle missing/invalid tokens gracefully

## Development Environment Issues

### Hot Reload Not Working

**Symptoms**:

- Code changes don't appear in browser
- Need to manually refresh after changes
- Build appears to be in production mode

**Resolution**:

1. Ensure running in development mode: `npm run dev`
2. Check `next.config.js` for development-specific settings
3. Clear browser cache and restart dev server
4. Verify file watcher isn't disabled

### Test Failures

**Symptoms**:

- E2E tests failing unexpectedly
- Authentication-related test failures
- Timeout errors in Playwright tests

**Diagnosis**:

```bash
# Run tests with verbose logging
PLAYWRIGHT_VERBOSE=true npm run test:e2e

# Check test logs for specific errors
TEST_LOG_ENABLE=true npm run test
```

**Common Issues**:

1. **Race conditions**: Tests running before authentication completes
2. **Cookie issues**: Session cookies not set properly in tests
3. **Network delays**: API responses taking longer than expected

**Resolution**:

```typescript
// Add proper waits in tests
await page.waitForLoadState('networkidle');
await expect(page.locator('[data-testid="auth-indicator"]')).toBeVisible();

// Use test fixtures for authentication
await loginViaApi(page); // Sets up proper auth state
```

## API Issues

### CORS Errors

**Symptoms**:

- "CORS policy" errors in browser console
- API requests failing from frontend
- Network requests blocked

**Resolution**:

1. Verify API server is running on correct port (4000)
2. Check CORS configuration in API server
3. Ensure frontend is making requests to correct API URL

### Database Connection Issues

**Symptoms**:

- "Database locked" errors
- SQLite connection failures
- Data not persisting

**Resolution**:

1. Check if multiple processes are accessing the database
2. Verify database file permissions
3. Ensure proper database connection cleanup
4. Check for unclosed database transactions

## Performance Issues

### Slow Page Load Times

**Diagnosis**:

1. Check Network tab for slow API requests
2. Look for large bundle sizes in build output
3. Monitor memory usage during navigation

**Resolution**:

1. Optimize API queries and add caching
2. Implement code splitting for large components
3. Add loading states for better perceived performance
4. Monitor and optimize bundle sizes

### High Memory Usage

**Symptoms**:

- Browser tab consuming excessive memory
- Gradual memory increase over time
- Browser becomes sluggish

**Common Causes**:

1. Memory leaks in useEffect (missing cleanup)
2. Event listeners not being removed
3. Large objects held in state unnecessarily

**Resolution**:

```typescript
// Proper useEffect cleanup
useEffect(() => {
  const handleEvent = () => {};
  window.addEventListener('event', handleEvent);

  return () => {
    window.removeEventListener('event', handleEvent);
  };
}, []);
```

## Logging and Debugging

### Enable Debug Logging

```bash
# Environment variables for detailed logging
TEST_LOG_ENABLE=true         # Enable test logging
TEST_LOG_CONSOLE=true        # Console output in tests
PLAYWRIGHT_VERBOSE=true      # Verbose Playwright output
NODE_ENV=development         # Development mode logging
```

### Debug Authentication State

```typescript
// Add to any component to debug auth state
const { authenticated, checking } = useAuth();
console.log('Auth Debug:', { authenticated, checking });

// Check auth context initialization
useEffect(() => {
  console.log('Auth context changed:', { authenticated, checking });
}, [authenticated, checking]);
```

### Monitor API Requests

```typescript
// Add to page to monitor requests
useEffect(() => {
  const observer = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      if (entry.name.includes('/api/')) {
        console.log('API Request:', entry.name, entry.duration);
      }
    });
  });
  observer.observe({ entryTypes: ['navigation', 'resource'] });

  return () => observer.disconnect();
}, []);
```

## Getting Help

### Information to Gather

When reporting issues, include:

1. **Environment**: Development/Production, OS, browser
2. **Steps to reproduce**: Exact sequence that causes the issue
3. **Expected vs Actual behavior**: What should happen vs what does happen
4. **Console errors**: Any errors in browser developer console
5. **Network activity**: Relevant API requests/responses
6. **Authentication state**: Whether user is logged in/out

### Debug Commands

```bash
# Check service status
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run all tests
npm run test:e2e     # Run E2E tests only
npm run lint         # Check code quality

# Clear caches
npm run clear-cache  # Clear TypeScript cache
rm -rf .next         # Clear Next.js cache
rm -rf node_modules && npm install  # Fresh dependencies
```

### Common Solutions

1. **Clear browser data**: Cookies, local storage, cache
2. **Restart services**: Stop and restart both frontend and API servers
3. **Fresh install**: Delete node_modules and reinstall dependencies
4. **Check environment**: Verify environment variables are set correctly
5. **Update dependencies**: Ensure all packages are up to date
