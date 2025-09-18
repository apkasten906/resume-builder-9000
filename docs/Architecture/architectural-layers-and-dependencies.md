# Architectural Layers and Dependencies

## Layer Structure

The project is organized into the following layers:

1. **Frontend Layer**:
   - **Purpose**: Provides the user interface and handles client-side logic.
   - **Components**: Next.js application located in `apps/web`.
   - **Dependencies**:
     - Communicates with the backend API via HTTP.
     - Uses Tailwind CSS for styling.

2. **Backend Layer**:
   - **Purpose**: Serves as the API layer, handling business logic and database interactions.
   - **Components**: Express application located in `packages/api`.
   - **Dependencies**:
     - Relies on the `core` package for shared business logic.
     - Interacts with the SQLite database.

3. **Core Layer**:
   - **Purpose**: Provides reusable business logic and utilities.
   - **Components**: Shared logic located in `packages/core`.
   - **Dependencies**:
     - Decoupled from frontend and backend-specific concerns.

## Dependency Rules

- **Frontend Layer**:
  - Depends on the Backend Layer for data and business logic.
  - Does not directly interact with the Core Layer.

- **Backend Layer**:
  - Depends on the Core Layer for shared logic.
  - Does not directly interact with the Frontend Layer.

- **Core Layer**:
  - Does not depend on any other layer.
  - Provides utilities and logic to the Backend Layer.

## Abstraction Mechanisms

- **Dependency Injection**:
  - Used in the Backend Layer to manage service dependencies.

- **Interface Segregation**:
  - Core Layer exposes specific interfaces for backend consumption.

- **Layer Separation**:
  - Each layer is strictly separated to ensure modularity and maintainability.

## Circular Dependencies

- No circular dependencies detected between layers.

## Layer Violations

- No layer violations detected. Each layer adheres to its defined responsibilities.
