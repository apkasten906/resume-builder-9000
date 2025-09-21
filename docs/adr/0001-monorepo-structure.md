# ADR 1: Monorepo Structure

## Context

The project consists of multiple components, including a frontend, backend, and shared core logic. Managing these components in separate repositories would increase complexity in dependency management and versioning.

## Decision

Adopt a monorepo structure using workspaces to manage all components in a single repository. This allows for easier dependency management, consistent versioning, and streamlined development workflows.

## Consequences

- **Positive**: Simplified dependency management, consistent versioning, and easier cross-component changes.
- **Negative**: Increased complexity in repository management and potential for larger repository size.
