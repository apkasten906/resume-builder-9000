# Authentication System

## Overview

Resume Builder 9000 uses a JWT-based authentication system with HTTP-only cookies to securely manage user sessions. This document describes the authentication flow, components, and implementation details.

## Authentication Flow

1. **Login Process**:
   - User submits credentials via the login form at `/login`
   - Next.js API route (`/api/auth/login`) forwards request to backend API
   - Backend validates credentials and returns a JWT token
   - Next.js sets token as an HTTP-only cookie and redirects to `/applications`

2. **Session Management**:
   - JWT tokens are stored as HTTP-only cookies (`session`) for frontend requests
   - Backend API routes validate tokens via the `Authorization` header or cookies
   - Token expiry is set to 7 days

3. **Protected Routes**:
   - Frontend API routes proxy authenticated requests to the backend
   - Backend middleware (`requireAuth`) validates tokens and attaches user info to requests

## Implementation Details

### Backend (Express API)

- **Authentication Service**: `packages/api/src/services/authService.ts`
  - `login()`: Validates credentials and issues JWT token
  - `getUserFromRequest()`: Extracts and validates token from request

- **Middleware**: `packages/api/src/middleware/requireAuth.ts`
  - Guards protected API routes
  - Validates tokens and attaches user info to request

- **Database**: User credentials stored with bcrypt-hashed passwords

### Frontend (Next.js)

- **Login Page**: `apps/web/src/app/login/page.tsx`
  - Form that submits to `/api/auth/login`

- **API Routes**:
  - `/api/auth/login`: Handles login and sets cookie
  - `/api/auth/me`: Validates session and returns user info
  - Other routes proxy authenticated requests to backend

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are signed with a secret key
- Authentication cookies are HTTP-only to prevent JavaScript access
- Backend validates tokens on every protected request

## Testing Authentication

Test user account:

- Email: `user@example.com`
- Password: `ValidPassword1!`

## Troubleshooting

If authentication issues occur, check:

1. Database connection and user table integrity
2. JWT secret configuration
3. Cookie settings in development vs. production
4. Cross-origin request handling
