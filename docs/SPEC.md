# Resume Builder 9000 — SPEC (Deterministic Core, No-AI)

## Vision

A resume **orchestration engine** that compiles a fully tailored, ATS-friendly resume (and optional cover letter) for a specific job posting. The system performs whole-document tailoring (section selection, ordering, bullet rewriting, skills panel, tone) using deterministic rules—no AI required.

## Build Mode Switch (Feature Flag)

- `ALLOW_EXTERNAL_LLM=false` → Deterministic core only (this SPEC).
- `ALLOW_EXTERNAL_LLM=true` → Optional AI helpers enabled (see SPEC-AI.md).

## Personas

- Experienced Candidate, Career Shifter, Early Career.

## Core Principles

- Whole-document tailoring; evidence first; ATS-safe output; deterministic controls (length/region/tone); learning loop (manual feedback).

## EPIC A — Candidate Data Ingestion

### A1: Parse Uploaded Resume(s)

- Accept `.pdf`, `.docx`, `.txt`, `.md` (max 5MB per file).
- Upload via UI drag-and-drop or file picker (`<ResumeUpload>` component).
- API endpoint: `POST /api/resumes/parse` (multipart form, file field `file`).
- Validation: allowed types, max size 5MB. Returns 400 for unsupported, 413 for too large.
- Extract: summary, experience (title, employer, dates), bullets, education, skills.
- Normalize dates `YYYY-MM`. Confidence flags for low-quality fields.
- Parsed JSON preview is shown in UI before persisting.
- On success, parsed resume is persisted in DB with schema:

      	```sql
      id TEXT PK,
      content TEXT (base64),
      resume_data TEXT (JSON),
      job_details TEXT (JSON),
      created_at TEXT
      ```

### A2: Manual Editor

- Review & fix extracted data, tag achievements (e.g., `cloud`, `leadership`).

### A3: Evidence Library

- Each bullet stored as `Achievement` with verb, skills, metric/outcome, tags, year.

## EPIC B — Job Intelligence (Rules Only)

### B1: JD Intake (paste text/URL/PDF)

- Extract title, seniority, location; parse “Requirements/Responsibilities/Preferred”.
- Tokenize and map skills via taxonomy JSON.

### B2: Taxonomy & Synonyms

- Canonical map, e.g., `{ "terraform": ["terraform", "iac"], "csharp": ["c#", ".net", "asp.net"] }`.

### B3: Soft Signals (regex)

- leadership, compliance, ambiguity tolerance.

## EPIC C — Tailoring Engine

### C1: Relevance Scoring

- Hybrid lexical + rules: `final = 0.5*lex + mustBonus + niceBonus + 0.6*recency`, scaled by seniority match.

### C2: Layout Synthesis

- JSON templates define section order, bullet quotas, collapse rules; 1-page default.

### C3: Deterministic Bullet Rewriter

- Template-based phrasing (no AI, no fabrication). 1 sentence, ≤ 180 chars, tense by role currentness, US/EU style toggle.

### C4: Skills Panel

- Derived from selected achievements. Include all must-haves; limit 12–18 items; grouped categories.

## EPIC D — Outputs

- `.txt` and `.md` (ATS-safe). Optional PDF rendered from `.md`.
- File path: `/outputs/{job_slug}/{timestamp}/resume.txt|md`

## EPIC E — Review & Red Flags

- Surface missing must-haves, page-length issues.
- Outcome tracking: `No response | Screening | Interview | Offer` stored with resume hash.

## EPIC F — Platform & Architecture

- Frontend: Next.js (App Router) + Tailwind + shadcn/ui.
- Backend: Node/Express (or FastAPI). SQLite for MVP.
- Parsing libs: pdf/dox parsers (rules/heuristics only).
- **Everything works offline with `ALLOW_EXTERNAL_LLM=false`.**

## Data Model (MVP)

See `packages/core/src/types.ts` for `JobProfile`, `Achievement`, etc.

## API (MVP)

- `POST /api/resumes/parse` → parses and persists resume, returns preview JSON `{ summary, experience, skills }`.
- `POST /api/ingest/jd` → job_id
- `POST /api/tailor` → run + outputs

## Acceptance Criteria

1. Must-have skills outrank otherwise similar bullets.
2. Recency outranks older with equal skills.
3. IC roles downweight `leadership` bullets (and vice versa).
4. Bullets ≤ 180 chars; no fabricated numbers if metric unknown.
5. 1-page layout enforces quotas; >10y roles collapse.

## Tests

- See `packages/core/tests/*` for relevance and rewrite tests (layout test stub).

## CLI (optional)

```bash
rb9k ingest --resume ./me.pdf
rb9k job --jd ./jd.txt
rb9k tailor --candidate <id> --job <id> --length 1p --region US --cover
```
