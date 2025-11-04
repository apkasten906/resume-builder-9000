# Quickstart — Resume upload & parse (feature)

Prerequisites

- Node.js 18+ and Yarn/NPM installed
- Run `setup.ps1` once to install dependencies and build packages (project root)
- Start dev environment: `dev.ps1` (or use `dev.sh`)

Local dev steps

1. Start the development servers (API + Web) using the repository dev script:

```powershell
.\dev.ps1 -PersistTestSecret
```

2. Open the web app at http://localhost:3000 and sign in with a test account (per repo dev script test credentials).

3. Navigate to the Resume Upload page (`/resume-upload`) and use the Upload control to select a small text-layer PDF (<= 10MB). The UI should POST the file to `/api/resume/parse` and show a preview with parsed regions.

4. Review highlighted regions, make edits or add new regions, then click Save. The UI will POST to `/api/resume/save` with `consent=true` and the list of reviewed regions.

Running tests

- Unit tests (Vitest): `npm run test` (from repo root)
- Playwright E2E: `npm run test:e2e` (ensure dev servers are running)

Notes

- This quickstart assumes MVP behavior: text-layer PDFs only (no OCR). Use sample text-layer PDFs for reliable results.
- If you want me to add a small sample PDF and an automated test fixture, tell me and I can add the test asset and example test.
