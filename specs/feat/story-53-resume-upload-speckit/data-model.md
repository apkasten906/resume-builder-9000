# Data Model: Resume upload & parse

Entities

- ResumeUpload
  - id: string (UUID)
  - uploaderId: string (user id)
  - uploadedAt: datetime
  - filename: string
  - contentType: string (application/pdf)
  - sizeBytes: integer
  - transient: boolean (true for in-memory-only uploads)

- ParsedRegion
  - id: string (UUID)
  - resumeUploadId: string (nullable for client-only transient regions)
  - page: integer
  - bbox: { x: number, y: number, width: number, height: number } (PDF coordinate space)
  - text: string
  - category: enum [contact, experience, education, skill, other]
  - confidence: number (0..1) optional

- UserProfileDraft
  - userId: string
  - personalInfo: { name?, email?, phone?, location? }
  - experiences: [{ title, company, startDate, endDate, description }]
  - education: [{ degree, institution, startDate, endDate, description }]
  - skills: [string]
  - sourceResumeId: string (optional link to ResumeUpload)

Validation rules

- Files: must be `application/pdf` and <= 10MB.
- ParsedRegion.text must be non-empty for saved regions.
- BBox coordinates must be within page bounds; page index must be >= 1.
- On Save: require explicit consent flag (boolean) in payload.

State transitions

- ResumeUpload: uploaded -> parsed -> reviewed -> saved/cancelled
- ParsedRegion: transient (client) -> reviewed -> persisted (upon Save)

Storage mapping

- MVP persists UserProfileDraft to existing profile tables (SQLite). ResumeUpload metadata may be recorded if needed for auditing, but raw PDF storage is optional and must be gated by policy.
