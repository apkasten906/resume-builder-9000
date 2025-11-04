# Feature Specification: Resume upload & parse# Feature Specification: Resume upload & parse

Feature Branch: `1-resume-upload-parse`Feature Branch: `1-resume-upload-parse`

Created: 2025-10-30Created: 2025-10-30

Status: DraftStatus: Draft

Input: "Allow users to upload a PDF resume and auto-parse contact info and work history for profile population. Users should be able to review parsed text using an overlay that shows the uploaded PDF with transparent boxes highlighting the regions of text that were identified. Users should be able to specify regions that were missed, remove parsed blocks, assign categories to regions or edit document region categories (experience, education, etc.)."Input: "Allow users to upload a PDF resume and auto-parse contact info and work history for profile population. Users should be able to review parsed text using an overlay that shows the uploaded PDF with transparent boxes highlighting the regions of text that were identified. Users should be able to specify regions that were missed, remove parsed blocks, assign categories to regions or edit document region categories (experience, education, etc.)."

---

## Overview## Overview

This feature enables authenticated users to upload machine-readable (text-layer) PDF resumes and quickly populate their profile by extracting contact information and work-history items. The user is shown a visual preview with selectable highlighted regions (parsed regions). Users can edit region text, change categories, remove incorrect regions, or add new regions before saving. No parsed PII is persisted until the user explicitly confirms Save.This feature enables authenticated users to upload machine-readable (text-layer) PDF resumes and quickly populate their profile by extracting contact information and work-history items. The user is shown a visual preview with selectable highlighted regions (parsed regions). Users can edit region text, change categories, remove incorrect regions, or add new regions before saving. No parsed PII is persisted until the user explicitly confirms Save.

## User Scenarios & Testing## User Scenarios & Testing

### User Story 1 — Upload and quick-parse (Priority: P1)### User Story 1 — Upload and quick-parse (Priority: P1)

As an authenticated user, I want to upload my resume (PDF) and have the system automatically extract my contact details and work history so I can quickly populate my profile.As an authenticated user, I want to upload my resume (PDF) and have the system automatically extract my contact details and work history so I can quickly populate my profile.

Independent Test:Independent Test:

- Upload a machine-readable PDF containing a clear contact block and a list of work experiences. Verify the UI shows parsed fields (email, phone, name, roles, companies, dates) and that the profile draft is populated.- Upload a machine-readable PDF containing a clear contact block and a list of work experiences. Verify the UI shows parsed fields (email, phone, name, roles, companies, dates) and that the profile draft is populated.

Acceptance Scenarios:Acceptance Scenarios:

- Given I am authenticated and on the Resume Upload page, when I upload a machine-readable PDF, then the system shows a visual preview of the first page and highlighted parsed regions representing contact, experience, and education.- Given I am authenticated and on the Resume Upload page, when I upload a machine-readable PDF, then the system shows a visual preview of the first page and a set of highlighted regions representing parsed fields (contact, experience, education).

- Given parsed regions are shown, when I click a region I can edit its text or change its category (contact, experience, education, skill, other).- Given parsed regions are shown, when I click a region, then I can change its category (experience, education, contact, skill, other) or edit the extracted text.

- Given a region is incorrect, when I remove it, it no longer contributes to the profile draft.- Given a region is incorrect, when I remove it, then it no longer contributes to the profile draft.

- Given content is missing, when I add a region (select area or paste text) and assign a category, it becomes part of the draft on Save.- Given some content was missed, when I draw/select a new region or paste text into an "Add region" form, then it becomes a named region and can be categorized and saved.

- Given I save the reviewed parsed results, the profile editor will reflect the saved contact and experience items.- Given I save the reviewed parsed results, when I view my profile editor, then the profile is populated with the saved contact and experience items.

---

## Privacy & Consent (Priority: P3)### User Story 2 — Review and correct (Priority: P2)

- No parsed PII is persisted until the user explicitly confirms Save.As a user I want a lightweight review experience so I can quickly confirm or correct parsed data before it goes into my profile.

- Users must see a consent notice during the review flow and may cancel without persistence.

Independent Test:

---

- After parsing, perform edits across several regions (change category, delete, add) and save; confirm the saved profile reflects the edits.

## Requirements (summary)

Acceptance Scenarios:

- FR-001: Allow authenticated users to upload a PDF (text-layer preferred).

- FR-002: Extract text blocks and propose parsed regions for contact and experience.- Given parsed regions are presented, when I change the category of a region, then the region's new category is reflected in the save payload.

- FR-003: Display an overlay with selectable/highlighted regions.- Given I add a new region, when I assign it a category and save, then the new region appears in the profile editor as the appropriate field.

- FR-004: Allow editing, categorization, addition, and removal of regions.

- FR-005: Do not persist parsed PII until user Save.---

- FR-006: On Save, write structured fields into the user's profile draft.

- FR-007: Provide user-facing errors for invalid file type/size and reasonable limits (e.g., 10MB).### User Story 3 — Privacy and consent (Priority: P3)

---As a user I want assurance that sensitive data extracted from my resume is handled privately and only saved when I explicitly confirm it.

## AssumptionsIndependent Test:

- MVP targets machine-readable PDFs (no OCR). Focus is on the first N pages to bound processing time.- Upload a resume and verify that no parsed content is persisted to the server until the user explicitly clicks Save; verify a clear consent notice is shown during the review flow.

- Users are authenticated and have profile write permissions.

Acceptance Scenarios:

---

- Given I upload a resume, when the automatic parse completes, then no parsed PII is sent to persistent storage until I click Save.

## Success Criteria (summary)- Given I decline to save, when I leave the page, then transient parsed data is removed from local client state.

- SC-001: Email and phone auto-detection on machine-readable PDFs: 80% coverage.## Edge Cases

- SC-002: Save flow completes quickly (90% under 3 minutes for small resumes).

- SC-003: No parsed PII persisted without explicit Save.- Scanned image PDFs (OCR required) — out of scope for MVP. Users should upload text-layer (machine-readable) PDFs or use manual entry for scanned documents.

- Very large PDFs (multi-page, > 20 pages) — system should either limit size or only process first N pages in MVP.

---- Poorly formatted or multilingual resumes — parsing accuracy may be reduced; provide an explicit fallback to manual entry.

- Multiple people on one document (e.g., portfolio) — only the primary contact/owner should be considered.

## Requirements (mandatory)

### Functional Requirements

- FR-001: The system MUST allow authenticated users to upload a PDF file from the Resume Upload page.
- FR-002: On upload, the system MUST extract text-based blocks and propose parsed regions representing contact information and work-history entries.
- FR-003: The system MUST display a visual overlay on top of the uploaded PDF preview that highlights each parsed region with a selectable box.
- FR-004: Users MUST be able to change the category of any parsed region to one of: contact, experience, education, skill, other.
- FR-005: Users MUST be able to remove parsed regions so they do not apply to the profile draft.
- FR-006: Users MUST be able to add a new region by selecting an area on the preview or pasting text, then assign a category and edit its text before saving.
- FR-007: The system MUST not persist any parsed PII to server-side storage until the user explicitly confirms Save.
- FR-008: On Save, the system MUST write the validated fields into the user profile draft (or call the profile update endpoint) in a structured form (name, email, phone, list of experience entries with title/company/dates/descriptions).
- FR-009: The system MUST present a clear consent notice that parsed PII will be saved only on user confirmation.
- FR-010: The UI MUST provide feedback for success/failure for parse, save, and upload actions.
- FR-011: The system MUST handle files up to a reasonable size (e.g., 10MB) and provide user-facing errors for larger files.

### Key Entities (include if feature involves data)

- ResumeUpload: represents an upload attempt (uploader id, timestamp, file metadata) — transient unless saved.
- ParsedRegion: { id, page, bbox, text, category } — a localized piece of parsed content with category metadata.
- UserProfileDraft: structure containing fields mapped from ParsedRegion (personalInfo, experience[], education[], skills[]).

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: 80% of machine-readable PDF uploads have email and phone auto-detected and surfaced as editable parsed regions in the review UI.
- SC-002: 90% of users complete the review and save flow in under 3 minutes for resumes with <= 3 experience entries.
- SC-003: No parsed PII is persisted to permanent storage without an explicit Save action from the user (auditable through logs or test harness).
- SC-004: Users can add or remove regions and see those changes reflected in the profile draft immediately after Save (verified in end-to-end tests).
- SC-005: The upload+parse flow returns an error message within 5 seconds if the upload is invalid (file type/size) or cannot be parsed.

## Assumptions

- MVP targets machine-readable PDFs (text layer present). OCR for scanned documents is out of scope for MVP.
- Initial implementation will focus on the first N pages (e.g., first page or first 3 pages) to bound processing time.
- Users are authenticated; profile write permissions are required to persist profile drafts.

## Notes

- This specification intentionally focuses on user-facing behavior and does not mandate parsing libraries, OCR providers, or storage formats. Implementation details should be chosen to meet success criteria and privacy requirements.

---
