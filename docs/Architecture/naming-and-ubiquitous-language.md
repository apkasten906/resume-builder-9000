# Naming & Ubiquitous Language (DDD)

We name modules, files, and types using the **ubiquitous language** of our domain. Choose **full, descriptive names** over abbreviations and implementation-centric terms.

## Bounded contexts
- **job-description** (intake & parsing)
- **resume** (authoring, formatting, export)
- **tailoring** (matching & scoring)
- **application-tracking** (applications, statuses, attachments, salary)

## Entities & value objects
- Entities: `Application`, `JobDescription`, `Resume`, `Attachment`, `StatusChange`
- Value objects: `Currency`, `Money`, `Score`, `Email`, `Url`

## Folder & file naming
- **Folders**: kebab-case domain concepts  
  `packages/core/src/domain/job-description/...`  
  `packages/api/src/modules/application-tracking/...`
- **Domain files**: PascalCase for domain classes (`JobDescription.ts`), no infra suffixes.
- **Adapters/infra files**: technical suffixes as appropriate  
  `job-description.controller.ts`, `application.repository.ts`, `resume.http.ts`
- **Functions**: present-tense verbs for use-cases/services (`scoreBullets`, `updateStage`).

## Acronyms & abbreviations
- **Allowed** (universally accepted): `API`, `URL`, `HTTP`, `ID`, `PDF`.
- **Avoid**: vague/ambiguous like `JD`, `CN`, `Cmpny`, `CvrLtr`. Prefer `JobDescription`, `Candidate`, `Company`, `CoverLetter`.
- If an acronym must appear in a **folder/file** name, prefer the **full term** instead.

## Refactor guidance
- Rename `jd/*` → `job-description/*`
- Rename types `JD` → `JobDescription`
- Replace ambiguous two-letter abbreviations with precise domain names in code, file names, and paths.

## Governance
This policy is enforced through code review and lint rules (see `eslint/patches/*`). Link this document from `architecture-governance.md` and `CONTRIBUTING.md`.
