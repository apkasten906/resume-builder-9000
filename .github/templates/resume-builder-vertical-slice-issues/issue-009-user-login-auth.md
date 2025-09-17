---
name: "User Login & Identity Management"
about: "Implement token-based login for authenticated usage"
title: "[Story] User Login & Identity Management"
labels: ["story", "vertical-slice", "auth"]
assignees: ""
---

## Summary
Require users to authenticate via token before using the Resume Builder.

## Frontend
- Login page: username/email + password
- Store token in memory (secure)
- Redirect on success

## API
- `POST /api/auth/login` → returns JWT
- `GET /api/auth/me` → returns profile
- `POST /api/auth/logout` (optional MVP)

## Business Logic
- Validate creds, hash passwords with bcrypt
- Issue JWT with expiry
- Middleware checks Authorization header

## Database
```sql
id INTEGER PK,
email TEXT UNIQUE,
password_hash TEXT,
created_at DATETIME
```

## Contracts (Types/DTOs)
```ts
type LoginRequest = { email: string; password: string };
type LoginResponse = { token: string; user: { id:string; email:string } };
```

## Acceptance Criteria (Gherkin)
```gherkin
Scenario: Successful login
  Given a registered user exists
  When POST valid creds
  Then token returned and /me returns profile
```

## Definition of Done
- [ ] Login form built and wired to API
- [ ] Auth endpoints with bcrypt + JWT
- [ ] DB migration adds `users` table
- [ ] Middleware requires token
- [ ] Unit + E2E tests
