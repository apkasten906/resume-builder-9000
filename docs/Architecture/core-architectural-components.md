# Core Architectural Components

## Frontend (apps/web)

### Frontend Purpose and Responsibility

- Provides the user interface for the application.
- Handles routing and rendering of pages using Next.js.
- Manages client-side interactivity and state.

### Frontend Internal Structure

- **`src/app`**: Contains feature-based components.
- **`src/pages`**: Implements routing and page-level components.

### Frontend Interaction Patterns

- Communicates with the backend API via HTTP.
- Uses server-side rendering (SSR) for initial page loads.
- Employs client-side rendering (CSR) for dynamic interactions.

### Frontend Evolution Patterns

- New features can be added as components in `src/app`.
- Routes can be extended by adding new files in `src/pages`.

---

## Backend (packages/api)

### Backend Purpose and Responsibility

- Serves as the API layer for the application.
- Handles business logic and database interactions.
- Provides endpoints for frontend communication.

### Backend Internal Structure

- **`controllers`**: Defines route handlers.
- **`services`**: Implements business logic.
- **`utils`**: Contains utility functions.

### Backend Interaction Patterns

- Exposes RESTful endpoints for the frontend.
- Utilizes the `core` package for shared logic.
- Interacts with the SQLite database for data persistence.

### Backend Evolution Patterns

- New endpoints can be added in `controllers`.
- Business logic can be extended in `services`.
- Shared utilities can be added to `utils`.

---

## Shared Logic (packages/core)

### Shared Logic Purpose and Responsibility

- Provides reusable business logic and utilities.
- Acts as a dependency for the backend.

### Shared Logic Internal Structure

- **`resume.ts`**: Implements core resume generation logic.
- **`index.ts`**: Exports shared modules and utilities.

### Shared Logic Interaction Patterns

- Imported by the backend for business logic.
- Decoupled from frontend-specific concerns.

### Shared Logic Evolution Patterns

- New shared utilities can be added as modules.
- Core logic can be refactored to improve reusability.
