# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js 18+ (LTS) with TypeScript 5.x
**Primary Dependencies**: Next.js (App Router), React 18, Tailwind CSS, pdfjs-dist (for text-layer PDF parsing), multer/formidable (file upload parsing), better-sqlite3 (local DB), express (API package in `@rb9k/api`), or repository-native packages in `apps/api`/`apps/web`.
**Storage**: SQLite for MVP (existing project uses SQLite); profile drafts persisted to the existing profile storage tables; transient parsed content remains client-side until Save.
**Testing**: Vitest for unit tests, Playwright for E2E; existing repo uses Vitest and Playwright (maintain parity).
**Target Platform**: Web application (Next.js frontend) + Node backend API (same monorepo); runs locally via `dev.ps1` and containerized in CI.
**Project Type**: Web application (frontend `apps/web`, backend `apps/api` / `@rb9k/api`).
**Performance Goals**: Parse first 1-3 pages within 5s for typical small resumes (<= 3 experience entries). Upload/parse UI should return invalid-file errors within 5s.
**Constraints**: PII must be treated as sensitive: do not persist parsed personal data until explicit Save; file size limit ~10MB; MVP excludes OCR (text-layer PDFs only).
**Scale/Scope**: MVP scoped for individual users (low traffic), target correctness & privacy first; future scaling plans marked as NEEDS CLARIFICATION if required.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
