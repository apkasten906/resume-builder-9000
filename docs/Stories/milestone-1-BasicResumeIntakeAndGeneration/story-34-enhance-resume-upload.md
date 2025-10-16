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

## Implementation Checklist

### Step 1: Upload/Parse Status Indicator

- [x] Add `loading` state to upload page/component
- [x] Show spinner or "Parsing..." message on Parse button while parsing
- [x] Disable Parse button and file input while loading
- [x] Update or add tests to cover loading state (except 5MB+ file, see note below)
- [ ] Commit after tests pass

### Step 2: Improve Error Handling

- [x] Catch and display API/network errors in a user-friendly way
- [x] Ensure error messages are actionable and accessible
- [x] Update or add tests to cover error state (except 5MB+ file, see note below)
- [ ] Commit after tests pass

### Step 3: Dashboard Table Enhancements

- [ ] Show spinner in uploads table while loading
- [ ] Show friendly error message in uploads table if API fails
- [ ] Populate table with up to 10 recent uploads after successful fetch
- [x] Ensure all states (loading, error, success) are testable via Playwright e2e tests (except 5MB+ file, see note below)
- [ ] Commit after tests pass

---

**Note:** The large file (>5MB) error scenario should be manually tested. Playwright cannot easily generate or upload a >5MB file in CI environments. The UI will show a user-friendly error: "File is too large. Maximum allowed size is 5MB."

### Step 4: Refactor for Accessibility and Robustness

- [ ] Ensure all status and error messages are announced to screen readers
- [ ] Refactor upload/dashboard logic for modularity and testability if needed
- [ ] Update or add tests for accessibility and edge cases
- [ ] Commit after tests pass
