# ADR 0008: Null vs Undefined for Optional and Missing Values

## Status

Accepted

## Context

The codebase currently uses `null` for representing optional and missing values in TypeScript interfaces, function return types, and database operations. This is reflected in type signatures such as `| null` and in return values throughout the API, core logic, and tests.

Recent code review feedback from GitHub Copilot recommended using `undefined` for optional/missing values, which is a modern JavaScript/TypeScript convention. However, switching to `undefined` would require a large-scale refactor across hundreds of files, including all business logic, API, and test files. This would also require updating type signatures, linter rules, and test assertions.

## Decision

We will continue to use `null` for optional and missing values throughout the codebase. This maintains consistency with existing type signatures, code, and tests, and avoids a disruptive refactor. The decision is pragmatic and prioritizes delivery velocity and maintainability.

## Consequences

- All new and existing code should use `null` for missing/optional values, matching the current type signatures and linter expectations.
- Any code review feedback recommending `undefined` will be deferred and tracked as technical debt.
- A future refactor to adopt `undefined` may be considered, but will require a dedicated story and migration plan.
- This ADR documents the rationale and ensures team alignment on the convention.

## Technical Debt

A tech debt story will be created to track the potential migration to `undefined` for optional/missing values, to be addressed in a future iteration when resources and priorities allow.

---

**Date:** 2025-09-30
**Author:** apkasten906
