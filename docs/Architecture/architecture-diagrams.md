# Architecture Diagrams

## High-Level Overview

```plaintext
resume-build-9000-dev/
├── apps/
│   └── web/                        # Frontend application (Next.js)
│       ├── src/app/                # App Router: user-facing routes only (no test/mocks)
│       ├── src/components/         # (optional) Shared UI components
│       ├── src/pages/              # (optional) Legacy routing and pages
│       └── tests/
│           ├── unit/               # Unit tests, test-only components, and mocks│           │
│           │   └── __mocks__/
│           └── e2e/                # End-to-end tests
├── packages/
│   ├── api/                        # Backend API (Express)
│   │   ├── controllers/            # Route handlers
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Utility functions
│   ├── core/                       # Shared business logic
```

## Component Interaction

```plaintext
[Frontend (apps/web)]
    ↕ (API calls via HTTP)
[Backend (packages/api)]
    ↕ (Shared logic import)
[Core (packages/core)]
```

## Data Flow

1. **Frontend**:
   - User interacts with the UI.
   - Sends requests to the backend API.
   - **All test-only code, mocks, and test data are isolated in `tests/` and never present in production routes/components.**

2. **Backend**:
   - Receives requests from the frontend.
   - Processes business logic using `core` package.
   - Interacts with the database.

3. **Core**:
   - Provides reusable business logic for the backend.

4. **Database**:
   - Stores and retrieves data for the backend.

```

```
