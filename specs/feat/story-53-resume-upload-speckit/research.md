# Phase 0 — Research: Resume upload & parse

This document records decisions and rationale for technical choices made during Phase 0. It resolves identified NEEDS CLARIFICATION in the implementation plan.

## Decision: Language & Runtime

- Decision: Use Node.js 18+ with TypeScript 5.x (aligns with existing repo).
- Rationale: The repository already uses Next.js + TypeScript; keeping the same runtime avoids cross-runtime complexity and leverages existing build/test tooling.
- Alternatives considered: Python server with Tesseract (rejected for MVP due to mismatch with repo conventions and additional infra).

## Decision: Parsing approach (MVP)

- Decision: Support text-layer (machine-readable) PDFs only for MVP; implement text extraction using `pdfjs-dist` on server or client depending on where extraction is easiest to secure; OCR is out-of-scope.
- Rationale: The user explicitly chose NO OCR for MVP. `pdfjs-dist` can extract text blocks from PDFs that contain a text layer and is lightweight compared to OCR.
- Alternatives considered: Tesseract/OCR (slower, heavier infra), cloud OCR providers (external calls, PII concerns) — deferred to future phases if OCR is required.

## Decision: Upload handling

- Decision: Accept uploads to `POST /api/resume/parse` (multipart/form-data) using the existing backend package (follow repo upload utilities). Limit size to 10MB and validate MIME type (application/pdf).
- Rationale: Standard pattern, aligns with existing API design and constraints in the constitution.
- Alternatives considered: Client-side-only parsing (faster but exposes parsing logic to clients); server-side parsing chosen for central validation and consistent behavior across clients.

## Decision: Transient storage and privacy

- Decision: Keep parsed regions transient on client until user clicks Save; on Save, write structured fields into the user's profile draft via `POST /api/resume/save` with explicit consent flag. Redact PII in server logs and do not store raw resume files by default.
- Rationale: Matches constitution privacy rules and user acceptance criteria.

## Decision: Libraries & dependencies

- Decision: Use `pdfjs-dist` for text-layer extraction, `multer`/`formidable` for parsing uploads on the server, and existing profile storage libraries in repo for persistence.
- Rationale: Minimal new dependencies, well-supported packages for the Node ecosystem.

## Decision: Testing & Quality Gates

- Decision: Add unit tests (Vitest) for parser helpers, integration tests for API routes (Vitest + supertest), and Playwright scenarios for the end-to-end review flow. Enforce lint & tests in CI.

## Open Questions / NEEDS_CLARIFICATION

- None blocking for Phase 0 — most technical choices resolved.

## Summary

All key technical unknowns for Phase 0 have been resolved: use Node/TypeScript, pdfjs-dist for text-layer parsing, server-side parse endpoint with 10MB limit, transient client-side state for parsed regions, and explicit Save to persist. OCR remains out-of-scope for MVP.
