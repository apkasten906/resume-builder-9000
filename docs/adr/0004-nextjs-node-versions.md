# ADR 4: Next.js and Node.js Versions

## Context

The project requires a stable and modern version of Next.js to leverage its latest features, such as app routing and server-side rendering. Additionally, the Node.js version must be compatible with Next.js and other project dependencies. The choice of versions impacts the ESLint setup, as certain rules and plugins may require specific versions of Next.js and Node.js.

## Decision

- Use **Next.js v15** to take advantage of the latest features and improvements.
- Use **Node.js v22+** for its stability, long-term support, and compatibility with Next.js v15.
- Update the ESLint configuration to include the `eslint-plugin-next` plugin, ensuring compatibility with Next.js v15 features and best practices.

## Consequences

- **Positive**:
  - Access to modern Next.js features, such as app routing and improved server-side rendering.
  - Stability and long-term support with Node.js v22+.
  - Improved code quality and adherence to Next.js best practices through the updated ESLint setup.
- **Negative**:
  - Developers must use Node.js v22+ or higher, which may require updates to local development environments.
  - Potential learning curve for developers unfamiliar with Next.js v15 features.
