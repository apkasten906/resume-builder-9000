# Story: Home Button / Overview Page

**Status:** In Progress

- Issue: resume-builder-9000 #33
- Assignee: apkasten906

---

## Description

Add a Home button and overview page to improve navigation and user experience.

## Acceptance Criteria

- RB9K logo is always clickable and brings users back to the home page

- Sign In and Log Out buttons are managed in the AppShell (top right of the app), not on the Home/Overview page itself
  - When signed in: Log Out button is visible, Sign In button is hidden
  - When not signed in: Sign In button is visible, Log Out button is hidden

- Home/Overview page adapts its view based on sign-in status:
  - If signed in:
    - Shows actionable insights/reminders at the top
    - Displays up to 10 most recent applications (each as a link to the future Application Details page), using the Table component
    - Displays up to 10 most recent resume uploads (each as a link to the future Uploaded Resume Details page), using the Table component
    - Both lists are shown in columns as before
    - Insights/reminders are always shown above recent lists
    - (copilot: Both application and resume upload links are placeholders until details pages are implemented)
  - If not signed in:
    - Home page presents a single prominent 'Get Started' call-to-action
    - When 'Get Started' is clicked, user is prompted: "Do you already have an account?" with options to Sign In or Register
    - Flow adapts based on user selection, minimizing cognitive load and streamlining onboarding
    - (copilot: Ensure accessibility and responsive design for all panes and prompts)
    - Tables for recent applications and resume uploads are hidden when not signed in
