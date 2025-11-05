# Checklist: Security & Privacy requirements quality — Resume upload & parse

Purpose: Unit-tests-for-English checklist focused on security/privacy requirements quality for the Resume upload & parse feature.
Created: 2025-11-04
Source: specs/1-resume-upload-parse/spec.md

## Metadata

- Focus: Security, privacy, logging, consent
- Depth: PR-review-level
- Audience: Author + Reviewer (Security/Engineering)

---

## Requirement Completeness

- [ ] CHK001 - Are authentication & authorization requirements for all endpoints documented (who can upload, who can save)? [Completeness, Spec §FR-001]
- [ ] CHK002 - Are input validation rules specified for uploads (MIME type, max size, filename sanitation)? [Completeness, Spec §FR-011]

## Requirement Clarity

- [ ] CHK003 - Are precise logging/redaction rules defined for parsed PII (what is logged, how PII is redacted)? [Clarity, Spec §Privacy & Consent]
- [ ] CHK004 - Is the required consent flow and the shape of the consent flag in `POST /api/resume/save` clearly specified (field name, boolean semantics)? [Clarity, Spec §FR-007/FR-009]

## Requirement Consistency

- [ ] CHK005 - Are data retention and retention-change rules consistent between API, quickstart, and data-model documents? [Consistency, Spec §Data Model]
- [ ] CHK006 - Are error-handling behaviors for security-related failures consistent (e.g., unauthorized, forbidden responses)? [Consistency]

## Acceptance Criteria Quality

- [ ] CHK007 - Is the definition of "no parsed PII persisted until Save" testable and auditable (logs, DB state) with acceptance criteria? [Measurability, Spec §Success Criteria]
- [ ] CHK008 - Are secure defaults specified for cookies, sessions, CSRF, and CORS for the upload and save endpoints? [Measurability, NFR]

## Scenario Coverage

- [ ] CHK009 - Are SSRF and server-side request protection requirements included when server fetches remote resources or resolves user-supplied URLs? [Coverage, Security]
- [ ] CHK010 - Are abuse/throttling scenarios addressed (rate limits, file upload rate, IP-based limits)? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK011 - Are the behaviors for malformed files and potential DOS vectors (large, corrupted PDFs) described and mitigations specified? [Edge Case, Spec §Edge Cases]
- [ ] CHK012 - Is secret management and non-hardcoded secret usage (env vars / secret store) required and referenced? [Edge Case, Security]

## Non-Functional Requirements

- [ ] CHK013 - Is encryption-in-transit explicitly required (HTTPS only) and documented as a prerequisite? [NFR, Spec §Security]
- [ ] CHK014 - Are dependency update and SCA scanning expectations specified (e.g., run `npm audit`, SCA pipeline)? [NFR, Traceability]

---

Notes:

- This checklist focuses on requirements clarity for security/privacy. Mark items as [Gap] if not present in the spec or related docs.
