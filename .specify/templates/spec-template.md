# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

_Example of marking unclear requirements:_

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

## Implementation guidance (mandatory for implementers)

- Architecture pattern: keep Express routers thin. Routers should only attach middleware (auth, multer, rate-limit) and mount controller handler functions. Controllers map HTTP -> DTOs, perform boundary validation, and call services. Services implement business logic and IO and must NOT depend on Express req/res objects.
- DTOs & validation: place canonical Zod/DTO schemas under `packages/core/src/dtos/` and import them from implementations (e.g., `ParsedRegionSchema`). Validate incoming request payloads at the controller boundary and pass validated plain objects into services.
- Parser placement: PDF parsing logic belongs in `packages/api/src/lib/` or `packages/api/src/services/` (e.g., `resumeParseService.ts`). Use `pdfjs-dist` as primary parser and a small fallback (e.g., pdf-parse) for edge cases. MVP supports text-layer PDFs only (no OCR). Normalize bounding boxes in the parser (see `packages/api/src/lib/bbox.ts`) so the frontend gets consistent coordinates.
- File upload rules: accept `application/pdf` only (field name `resume`), validate size server-side (configurable; use 5MB default for quick-parsing MVP), and prefer transient storage (memory or temp file) while parsing; remove files after processing.
- Tests & locations: unit and contract tests for backend live in `packages/api/tests/` using Vitest. Playwright E2E tests belong under `apps/web/tests/e2e/` and should use the `WEB_BASE` env var for the web app base URL (also document `PLAYWRIGHT_API_PORT`, `ENABLE_TEST_ROUTES` and `TEST_ROUTE_SECRET` as needed).
- Test fixtures: generate small text-layer PDFs using `pdf-lib` for deterministic parser tests instead of committing binary fixtures when possible.
- Privacy: do not persist parsed PII until the user explicitly clicks Save. Keep the parse endpoint returning transient parsed regions; saving is a separate API call that performs consent checks.
- Small, local changes only: update ADR/docs when changing architectural patterns that affect other teams. Reference canonical implementation files: `packages/api/src/controllers/resume.ts`, `packages/api/src/services/resumeParseService.ts`, and `packages/core/src/dtos/parsed-region.dto.ts`.

_Add these guidance bullets to plan.md/tasks.md and PR descriptions so reviewers can validate pattern compliance._
