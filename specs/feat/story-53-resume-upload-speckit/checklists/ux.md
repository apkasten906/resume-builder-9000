# Checklist: UX requirements quality — Resume upload & parse

Purpose: Unit-tests-for-English checklist focused on UX / frontend requirement quality for the Resume upload & parse feature.
Created: 2025-11-04
Source: specs/1-resume-upload-parse/spec.md

## Metadata

- Focus: UX requirements (upload page, overlay, region editing, add-region flows)
- Depth: PR-review-level
- Audience: Author + Reviewer (Product/Design/Engineering)

---

## Requirement Completeness

- [ ] CHK001 - Are all user-facing pages and components required by the spec explicitly listed (Upload page, Preview overlay, Region editor, Add-region form)? [Completeness, Spec §Overview]
- [ ] CHK002 - Are all user actions across the flow described (upload, inspect, edit region, add region, delete region, save, cancel)? [Completeness, Spec §User Scenarios]

## Requirement Clarity

- [ ] CHK003 - Are interaction affordances and controls defined with exact labels and behaviors (how a user draws/selects a region, how edits are persisted)? [Clarity, Spec §FR-006]
- [ ] CHK004 - Are visual design expectations (highlight color, opacity, hover/focus states, accessible contrast) specified or linked to design tokens? [Clarity, Spec §FR-003]
- [ ] CHK005 - Is the expected behavior for region selection vs. text-selection clarified (e.g., click to edit text vs. drag to create a new region)? [Clarity, Spec §FR-004]

## Requirement Consistency

- [ ] CHK006 - Are category labels, naming, and ordering consistent with API categories (contact, experience, education, skill, other)? [Consistency, Spec §FR-004]
- [ ] CHK007 - Are messages and error copy for upload/parse/save consistent with API error formats and spec acceptance scenarios? [Consistency, Spec §Acceptance Scenarios]

## Acceptance Criteria Quality

- [ ] CHK008 - Are acceptance criteria measurable (e.g., "preview displays first page within X seconds") and tied to specific UI elements? [Measurability, Spec §Success Criteria]
- [ ] CHK009 - Are keyboard & screenreader interactions defined for critical flows (region selection, edit, add, save)? [Accessibility, Spec §NFR-A11Y]

## Scenario Coverage

- [ ] CHK010 - Are primary, alternate, and exception flows covered for UX (successful parse, parse with missing fields, parse failure, consent decline)? [Coverage, Spec §User Scenarios]
- [ ] CHK011 - Are zero-state and empty-result behaviors defined for the preview (no parsed regions found)? [Coverage, Edge Case]

## Edge Case Coverage

- [ ] CHK012 - Are instructions or fallback UIs defined for unsupported PDFs (scanned image PDFs) and when parsing fails? [Edge Case, Spec §Assumptions]
- [ ] CHK013 - Is the expected behavior for multiple resumes uploaded sequentially or concurrent uploads defined? [Edge Case, Spec §Edge Cases]

## Non-Functional Requirements (UX-focused)

- [ ] CHK014 - Are accessibility requirements specified with measurable success criteria (WCAG level, keyboard navigation, focus order)? [Accessibility, Spec §NFR-A11Y]
- [ ] CHK015 - Are feedback & loading states specified for asynchronous operations (uploading, parsing, saving) including timeouts and retry guidance? [NFR, Spec §Performance Goals]

---

Notes:

- Reference the design system where available. Mark items with [Gap] when missing.
