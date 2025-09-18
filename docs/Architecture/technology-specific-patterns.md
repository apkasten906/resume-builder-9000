# Technology-Specific Patterns

## Next.js (Frontend)

- **Routing**:
  - Utilizes the App Router for file-based routing.
  - Dynamic routes are defined using square brackets (e.g., `[id].tsx`).

- **State Management**:
  - React Context API is used for global state management.
  - Server-side props and static props are used for data fetching.

- **Styling**:
  - Tailwind CSS is used for utility-first styling.
  - Custom themes are defined in `tailwind.config.js`.

- **Testing**:
  - Vitest is used for unit and integration testing.
  - React Testing Library is used for component testing.

## Express.js (Backend)

- **Routing**:
  - Routes are modularized using the `Router` class.
  - Controllers handle route-specific logic.

- **Middleware**:
  - Custom middleware is used for authentication, logging, and error handling.
  - Third-party middleware includes `cors` and `helmet` for security.

- **Database Access**:
  - SQLite is used as the database.
  - Queries are abstracted using a service layer.

- **Validation**:
  - `zod` is used for schema validation.
  - Validation is applied at the API boundary.

## Tailwind CSS

- **Utility Classes**:
  - Utility classes are used for rapid UI development.
  - Custom utilities are defined in `tailwind.config.js`.

- **Responsive Design**:
  - Media queries are handled using Tailwind's responsive utilities.

## SQLite

- **Schema Management**:
  - Database schema is defined using SQL scripts.
  - Migrations are managed manually.

- **Data Access**:
  - Queries are parameterized to prevent SQL injection.
  - Data access logic is encapsulated in the service layer.

## Vitest

- **Test Organization**:
  - Tests are colocated with the code they test.
  - Test files follow the naming convention `*.test.ts`.

- **Mocking**:
  - Mocking is used for external dependencies.
  - `vi.fn()` is used to create mock functions.

## Future Enhancements

- **Frontend**:
  - Introduce Redux for more complex state management.

- **Backend**:
  - Add support for GraphQL.

- **Testing**:
  - Implement end-to-end testing using Playwright or Cypress.
