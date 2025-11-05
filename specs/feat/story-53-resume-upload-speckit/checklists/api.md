# Checklist: API requirements quality — Resume upload & parse

Purpose: Unit-tests-for-English checklist focused on API / backend requirements quality for the Resume upload & parse feature.
Created: 2025-11-04
Source: specs/1-resume-upload-parse/spec.md

## Metadata

- Focus: API requirements (upload, parse, save, consent, errors)
- Depth: Standard (PR review) — prioritize clarity & completeness for implementers
- Audience: Author + Reviewer (QA/Engineering)

---

## Requirement Completeness

- [ ] CHK001 - Are the API endpoints required by the spec explicitly listed (paths, methods, and expected payloads) for upload, parse, and save? [Completeness, Spec §Requirements]
- [ ] CHK002 - Is the expected JSON response shape for `POST /api/resume/parse` documented, including the parsed region array schema (id, page, bbox, text, category, confidence)? [Completeness, Spec §FR-002]
- [ ] CHK003 - Are error response formats defined for all failure modes (invalid file, oversized file, parsing error, unauthorized)? [Completeness, Spec §FR-011]
- [ ] CHK004 - Is the required consent flag and its expected form/presence on `POST /api/resume/save` documented? [Completeness, Spec §FR-007/FR-009]

## Requirement Clarity

- [ ] CHK005 - Is the allowed file type(s) and MIME acceptance criteria explicitly specified (e.g., `application/pdf` only) and where it should be validated (client vs. server)? [Clarity, Spec §FR-001/FR-011]
- [ ] CHK006 - Are size limits (e.g., 10MB) quantified and the server-side behavior on oversize documented (HTTP status, error code, message)? [Clarity, Spec §FR-011]
- [ ] CHK007 - Is the interpretation of `bbox` coordinate space explicitly defined (PDF coordinate system, origin, units) so backend and frontend can agree? [Clarity, Spec §ParsedRegion]
- [ ] CHK008 - Is the concept of "transient" vs "persisted" resume upload and parsed regions precisely defined, including lifecycle and retention expectations? [Clarity, Spec §Privacy & Consent]

## Requirement Consistency

- [ ] CHK009 - Are category values for parsed regions (contact, experience, education, skill, other) consistently documented and referenced across spec and tasks? [Consistency, Spec §FR-004]
- [ ] CHK010 - Do the error handling requirements align between API endpoints and the UI acceptance scenarios (messages the UI must display)? [Consistency, Spec §Acceptance Scenarios]

## Acceptance Criteria Quality

- [ ] CHK011 - Are success criteria measurable and testable (e.g., SC-001 80% email/phone detection) including how coverage is measured and sampled? [Measurability, Spec §Success Criteria]
- [ ] CHK012 - Are time/performance expectations expressed as concrete thresholds for parsing and upload error feedback (e.g., parse returns within X seconds)? [Measurability, Spec §Performance Goals]

## Scenario Coverage

- [ ] CHK013 - Are primary, alternate, exception, and recovery flows documented for the upload->parse->review->save sequence (including cancel, consent declined, and partial saves)? [Coverage, Spec §User Scenarios]
- [ ] CHK014 - Are concurrency concerns and race conditions considered, e.g., two concurrent save requests or multiple tabs editing the same draft? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK015 - Are boundary cases specified: scanned/OCR-only PDFs (explicitly out-of-scope but with guidance), very large PDFs, multi-person documents, multilingual content? [Edge Case, Spec §Edge Cases]
- [ ] CHK016 - Is the behavior documented for malformed PDFs or files with no text layer (clear rejection vs. best-effort parsing)? [Edge Case, Spec §Assumptions]

## Non-Functional Requirements

- [ ] CHK017 - Are privacy and logging requirements for parsed PII specified (what to redact, what to store in logs, auditability expectations)? [Security/Privacy, Spec §Privacy & Consent]
- [ ] CHK018 - Is the versioning strategy and backward-compatibility approach for the parse API responses documented (how to evolve region schema)? [Non-Functional, Traceability]

---

Notes:

- Each item references the specification where applicable. Mark items with [Gap] when missing.
- This file was generated as a PR-review-level checklist focusing on API requirement quality. For UX requirements create `ux.md` with similar structure.
