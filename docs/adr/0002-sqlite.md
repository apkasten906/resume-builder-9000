# ADR 2: SQLite for Database

## Context

The project requires a lightweight, file-based database solution for storing resumes and related data. The database should be easy to set up and maintain without requiring a dedicated database server.

## Decision

Use SQLite as the database for the project. SQLite is lightweight, easy to integrate, and sufficient for the project's data storage needs.

## Consequences

- **Positive**: Simple setup, minimal maintenance, and no need for a separate database server.
- **Negative**: Limited scalability and concurrency compared to more robust database solutions.
