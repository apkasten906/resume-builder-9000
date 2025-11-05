# Checklist: Performance & Non-Functional requirements quality — Resume upload & parse

Purpose: Unit-tests-for-English checklist focused on performance and non-functional requirement quality for the Resume upload & parse feature.
Created: 2025-11-04
Source: specs/1-resume-upload-parse/spec.md

## Metadata

- Focus: Performance (latency, throughput), scalability, observability
- Depth: PR-review-level
- Audience: Author + Reviewer (Engineering/Platform)

---

## Requirement Completeness

- [ ] CHK001 - Are performance targets specified for the critical flows (upload latency, parse latency, save latency)? [Completeness, Spec §Performance Goals]
- [ ] CHK002 - Is the acceptable load profile or expected concurrency documented for initial MVP usage? [Completeness, Spec §Scale/Scope]

## Requirement Clarity

- [ ] CHK003 - Are timeouts and retry behaviors specified for parsing operations and external calls? [Clarity, NFR]
- [ ] CHK004 - Is the behavior defined when parsing exceeds expected time (cancellation, background processing, user feedback)? [Clarity, Spec §Performance Goals]

## Requirement Consistency

- [ ] CHK005 - Are monitoring and alerting requirements (SLO indicators) consistent with performance objectives in plan.md? [Consistency, Traceability]
- [ ] CHK006 - Are resource limits and expected memory/CPU footprint for parsing workers described or bounded? [Consistency, NFR]

## Acceptance Criteria Quality

- [ ] CHK007 - Are measurable thresholds for acceptable latency defined (e.g., 90th percentile parse time < X ms) and how they are to be measured? [Measurability, Spec §Success Criteria]
- [ ] CHK008 - Is the failure mode for overloaded parsing capacity defined (queueing, reject with clear error)? [Measurability, Gap]

## Scenario Coverage

- [ ] CHK009 - Are degradation strategies defined for heavy loads (process N pages only, rate limit, queue + worker model)? [Coverage, Edge Case]
- [ ] CHK010 - Are test and benchmark plans indicated for performance validation (bench scripts, sample dataset)? [Coverage, Traceability]

## Edge Case Coverage

- [ ] CHK011 - Is the expected behavior specified for very large PDFs or PDFs with many pages (e.g., process only first N pages)? [Edge Case, Spec §Assumptions]
- [ ] CHK012 - Are expectations defined for retries after partial failures (idempotency & duplicate save handling)? [Edge Case, Spec §Assumptions]

---

Notes:

- Generated for PR-review depth; reference plan.md/quickstart.md where relevant. Mark items [Gap] if missing.
