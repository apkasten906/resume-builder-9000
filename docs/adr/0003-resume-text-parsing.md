# ADR 0003 — Resume text parsing and contact extraction

Date: 2025-11-13

Status: Accepted

## Context

The initial resume upload implementation only surfaced summary/experience/skills by scanning for explicit `Summary:` or `Experience:` prefixes. Real resumes – including the Brian Faker PDF we use in E2E – contain richer sections without those markers (multi-line paragraphs, en-dash–separated job headers, contact blocks near the top). As a result:

* The upload review UI showed “No experience found” unless the source file matched the narrow prefix pattern.
* The resume-details editor always rendered empty personal information (name, email, phone, address, websites), forcing users to retype obvious data.
* There was no automated regression test proving that an uploaded resume hydrates the editor with its parsed fields.

## Decision

1. **Add a dedicated text parser (`packages/api/src/utils/resumeTextParser.ts`).**
   * Tokenizes PDF/DOCX/TXT output into `summary`, structured `experiences`, `skills`, `education`, and a new `personalInfo` shape.
   * Experience headers match Unicode en-dash/ASCII dash separators and normalize date ranges to `YYYY-MM`.
   * A header scan infers contact information (name, email(s), phone(s), addresses, sites) before the “Languages/Experience” sections.

2. **Fallback compatibility.**
   * The legacy line-based parser still runs; whichever parser yields data first wins, and lists are merged/deduped.

3. **Persist contact fields everywhere.**
   * Resume uploads now populate `resumeData.personalInfo` plus the parsed-resume repository with extracted contact info so `/resume-details` loads prefilled inputs.

4. **Add regression coverage.**
   * New Playwright spec `apps/web/tests/e2e/parsed-resume-details.spec.ts` uploads the Brian Faker PDF and asserts summary, experience, skills, education, and contact fields are visible on both the upload confirmation screen and the resume-details editor.

## Rationale

* Keeps heuristics encapsulated in one module, making it easier to extend with NLP/LLM parsing later.
* Users see meaningful data immediately after uploading, reducing manual editing.
* The E2E test guards the entire flow and prevents regressions when the parser or UI change.

## Consequences

| Type | Notes |
| --- | --- |
| Positive | Resume uploads feel “smart” and unlock editing workflows without copy/paste. |
| Positive | Contact parsing is reusable (e.g., future “auto-fill application” features). |
| Negative | Parser is heuristic-based; unusual resume layouts may still need manual tweaks. |
| Negative | Slightly higher CPU cost during upload (single pass over text + regex scans). |

## Verification

* `npm run build --workspace=@rb9k/api`
* `npx playwright test apps/web/tests/e2e/parsed-resume-details.spec.ts --config=apps/web/tests/e2e/playwright.config.ts --reporter=dot --workers=1`

## Follow-ups

* Consider moving shared parsing logic into `@rb9k/core` if other packages need it.
* Expand unit tests around `resumeTextParser` when we add new fixtures (DOCX, resumes with tables).
