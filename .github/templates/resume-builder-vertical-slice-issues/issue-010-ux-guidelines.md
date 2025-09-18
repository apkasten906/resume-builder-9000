---
name: "UX Guidelines"
about: "Create design rules for consistency"
title: "[Story] UX Guidelines"
labels: ["story", "guideline", "ux"]
assignees: ""
---

## Summary
Provide a UX guideline to ensure consistent design and accessibility.

## Goals
- Consistent layout, typography, colors
- Accessibility (WCAG AA)
- Predictable states
- AI-friendly naming

## Components to Define
- Buttons (primary, secondary, disabled)
- Form inputs
- Status indicators
- Panels (resume preview, JD preview, tailored resume, red flags)

## Rules
- Semantic HTML
- aria-labels required
- Loading state <500ms
- Errors: user-friendly + dev log
- Default font: system-ui

## Deliverable
- `docs/ux-guidelines.md` created with examples and checklist

## Acceptance Criteria (Gherkin)
```gherkin
Scenario: Buttons follow guideline
  Given a button is rendered
  Then it matches rules from guidelines
```

## Definition of Done
- [ ] `docs/ux-guidelines.md` created
- [ ] Components documented
- [ ] Accessibility checklist included
- [ ] Existing UI reviewed
