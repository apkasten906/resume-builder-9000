# Story: Enhance Resume Upload

**Status:** To Do

- Issue: resume-builder-9000 #34

---

## Description

Enhance the resume upload feature:

- Rename the upload button
- Show upload status
- Provide helpful error messages

## Acceptance Criteria

- Upload button is clearly labeled
- Status is displayed during upload
- Error messages are user-friendly and actionable
- Resume uploads table in dashboard shows spinner while loading
- Error message is shown in uploads table frame if API fails: "Apologies! We are having trouble retrieving your uploaded resumes right now."
- Table is populated with up to 10 recent uploads after successful fetch
- All states (loading, error, success) are testable via Playwright e2e tests
- Dashboard integration is async and robust to backend failures
