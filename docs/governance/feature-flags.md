# Feature Flags & Safe Releases

## Purpose

Provide guidance for using feature flags to reduce release risk and enable progressive rollouts.

## Guiding rules

- Use reliable feature flag systems (e.g., toggles backed by config service or third-party provider).
- Default to flags off for risky or incomplete features; enable via targeting rules in production when ready.
- Always include an easily-accessible kill-switch for any flag that affects customer-facing behavior.

## Checklist (PR / Release)

- [ ] Is the new feature behind a flag with an explicit default state?
- [ ] Does the flag have an owner and a planned removal date?
- [ ] Is there a kill-switch and monitoring for the flaged behavior?

## Notes

- Prefer short-lived flags and remove them soon after rollout to avoid technical debt.
