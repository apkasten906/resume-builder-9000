# Route Protection Implementation

## Overview

This document describes the route protection mechanism implemented in the Resume Builder 9000 application to ensure that unauthenticated users cannot access protected pages.

## Problem Statement

Before implementing route protection, the application had the following issues:

1. Unauthenticated users could access any route (e.g., `/resume-upload`, `/applications`, `/tailor`)
2. Protected pages would render with missing data or errors when accessed without authentication
3. Navigation menu items were visible but led to non-functional pages
4. The user experience was inconsistent - some pages worked without auth, others didn't

## Solution Architecture

### Client-Side Route Protection

We implemented a client-side route protection mechanism using React components and the Next.js App Router. This approach leverages the existing `AuthContext` to check authentication state and automatically redirect unauthenticated users.

### Key Components

#### 1. `ProtectedRoute` Component

**Location:** `apps/web/src/components/auth/ProtectedRoute.tsx`

**Purpose:** Wraps protected page content and handles authentication checks and redirects.

**Behavior:**

- **Checking State:** Shows a loading spinner while authentication status is being determined
- **Unauthenticated:** Redirects to the home page (`/`)
- **Authenticated:** Renders the protected content

**Usage Example:**

```tsx
export default function MyProtectedPage(): ReactElement {
  return (
    <ProtectedRoute>
      <div className="grid gap-6">
        <h1>Protected Page Content</h1>
        {/* Page content here */}
      </div>
    </ProtectedRoute>
  );
}
```

#### 2. `AuthContext`

**Location:** `apps/web/src/context/AuthContext.tsx`

**Purpose:** Provides authentication state throughout the application.

**Key State:**

- `authenticated: boolean` - Whether the user is logged in
- `checking: boolean` - Whether authentication status is being verified
- `user: User | null` - Current user information

**Key Methods:**

- `refreshAuth()` - Manually refresh authentication status
- `logout()` - Log out the current user

### Protected vs Public Routes

#### Protected Routes (Require Authentication)

These routes are wrapped with `<ProtectedRoute>` and redirect unauthenticated users to `/`:

- `/resume-upload` - Upload and parse resume
- `/applications` - View and manage job applications
- `/job-intake` - Input job description
- `/tailor` - Tailor resume for specific jobs
- `/preview` - Preview tailored resume
- `/output` - Download resume
- `/settings` - User settings
- `/resume-builder` - Resume builder interface
- `/compose` - Compose resume

#### Public Routes (No Authentication Required)

These routes remain accessible to everyone:

- `/` - Home page (shows hero for unauthenticated, dashboard for authenticated)
- `/about` - About page
- `/login` - Login page
- `/register` - Registration page
- `/confirm-email` - Email confirmation page
- `/style-guide` - Style guide (development)

## Implementation Details

### Step 1: Create ProtectedRoute Component

Created a reusable wrapper component that:

1. Uses the `useAuth()` hook to access authentication state
2. Uses `useRouter()` from Next.js to perform redirects
3. Implements a `useEffect` to redirect when authentication check completes and user is not authenticated
4. Shows a loading state during authentication check
5. Returns `null` for unauthenticated users (while redirect is in progress)
6. Renders children for authenticated users

### Step 2: Update Protected Pages

For each protected page, we:

1. Added import: `import { ProtectedRoute } from '@/components/auth/ProtectedRoute';`
2. Wrapped the return content with `<ProtectedRoute>` component

Example transformation:

**Before:**

```tsx
export default function ApplicationsPage(): React.ReactElement {
  // ... component logic ...

  return <div className="grid gap-6">{/* page content */}</div>;
}
```

**After:**

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ApplicationsPage(): React.ReactElement {
  // ... component logic ...

  return (
    <ProtectedRoute>
      <div className="grid gap-6">{/* page content */}</div>
    </ProtectedRoute>
  );
}
```

### Step 3: Navigation Menu Visibility

The `AppShell` component already handles navigation menu visibility:

```tsx
const showNavigation = authenticated && !checking;
```

This ensures that:

- Navigation menu is hidden while authentication is being checked
- Navigation menu is hidden for unauthenticated users
- Navigation menu is visible only for authenticated users

## User Experience Flow

### Unauthenticated User Accessing Protected Route

1. User navigates to `/resume-upload`
2. Page starts loading
3. `ProtectedRoute` component mounts
4. Authentication check is performed via `useAuth()`
5. Loading spinner is shown briefly
6. Authentication check completes: `authenticated=false, checking=false`
7. `useEffect` triggers redirect to `/`
8. User sees home page with "Get Started" button

### Authenticated User Accessing Protected Route

1. User navigates to `/resume-upload`
2. Page starts loading
3. `ProtectedRoute` component mounts
4. Authentication check is performed via `useAuth()`
5. Authentication check completes: `authenticated=true, checking=false`
6. Protected page content is rendered
7. User sees the resume upload interface

### User Logging Out

1. User clicks "Log out" button
2. `logout()` method in `AuthContext` is called
3. Session cookie is cleared via API call
4. `authenticated` state is set to `false`
5. User is redirected to home page (`/`)
6. If user tries to access protected routes, they are redirected back to `/`

## Testing

### Unit Tests

**Location:** `apps/web/tests/unit/ProtectedRoute.test.tsx`

Tests cover:

- Loading state display during authentication check
- Redirect behavior for unauthenticated users
- Content rendering for authenticated users
- State transitions (checking → authenticated, checking → unauthenticated)
- Complex child component rendering

### E2E Tests

**Location:** `apps/web/tests/e2e/route-protection.spec.ts`

Tests cover:

- Redirect from each protected route when unauthenticated
- Public routes remain accessible without authentication
- Authenticated users can access protected routes
- Logout redirects to home page
- Navigation menu visibility based on authentication state
- Direct URL navigation to protected routes
- Authentication persistence across page reloads

**Run E2E Tests:**

```bash
npx playwright test apps/web/tests/e2e/route-protection.spec.ts --config=apps/web/tests/e2e/playwright.config.ts
```

**Run Unit Tests:**

```bash
npm test apps/web/tests/unit/ProtectedRoute.test.tsx
```

## Security Considerations

### Client-Side Protection

**Important:** This implementation provides **client-side** route protection only. This prevents unauthorized users from viewing protected UI, but does not secure the API endpoints.

### API-Level Security

All API endpoints that handle sensitive data **must** implement their own authentication and authorization checks. The backend API should:

1. Verify JWT tokens or session cookies
2. Check user permissions for each operation
3. Return 401 Unauthorized for unauthenticated requests
4. Return 403 Forbidden for unauthorized requests

**Example API Security (Backend):**

```typescript
// Middleware to verify authentication
app.use('/api/applications', authenticateUser, applicationsRoutes);

function authenticateUser(req, res, next) {
  const token = req.cookies.session;

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = getUserFromToken(token);
  next();
}
```

### Defense in Depth

The route protection provides the first layer of defense:

1. **Client-Side Protection (UI):** Prevents users from seeing protected pages
2. **API-Level Protection (Backend):** Prevents unauthorized data access
3. **Database-Level Protection:** Ensures data integrity and user isolation

## Troubleshooting

### Issue: User sees flash of protected content before redirect

**Cause:** Authentication check takes time to complete

**Solution:** This is expected behavior. The loading state minimizes the flash. If it's too noticeable, consider:

- Increasing the loading spinner visibility
- Adding a fade transition to the redirect
- Using Next.js middleware for server-side redirect (future enhancement)

### Issue: User is redirected even though they are logged in

**Cause:** Session cookie may be expired or invalid

**Solution:**

1. Check browser dev tools → Application → Cookies
2. Verify `session` cookie exists and has valid value
3. Check API `/api/auth/me` response
4. Clear cookies and log in again

### Issue: Protected content renders briefly before redirect

**Cause:** Component renders children before useEffect executes

**Solution:** The current implementation returns `null` for unauthenticated users to prevent rendering. If you see content, check:

1. Ensure `ProtectedRoute` is wrapping ALL page content
2. Verify the wrapping is at the top level of the return statement

## Future Enhancements

### 1. Next.js Middleware (Server-Side Protection)

**Benefits:**

- Faster redirects (server-side before page loads)
- No flash of content
- Better SEO handling

**Implementation:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/resume-upload', '/applications' /* ... */];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');

  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}
```

### 2. Role-Based Access Control (RBAC)

Extend `ProtectedRoute` to support role checking:

```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### 3. Permission-Based Access

More granular control with permissions:

```tsx
<ProtectedRoute requiredPermissions={['resume:read', 'resume:write']}>
  <ResumeEditor />
</ProtectedRoute>
```

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Context API](https://react.dev/reference/react/useContext)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Changelog

- **2025-10-16:** Initial implementation of client-side route protection
  - Created `ProtectedRoute` component
  - Updated all protected pages
  - Added unit and E2E tests
  - Created documentation
