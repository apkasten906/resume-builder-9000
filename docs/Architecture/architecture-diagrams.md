# Architecture Diagrams

## High-Level Overview

```plaintext
resume-build-9000-dev/
├── apps/
│   └── web/                # Frontend application (Next.js)
│       ├── src/app/        # Feature-based components
│       ├── src/pages/      # Routing and pages
├── packages/
│   ├── api/                # Backend API (Express)
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   ├── core/               # Shared business logic
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
