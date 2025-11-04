# Release & Rollback Practices

## Purpose

Document expected release hygiene and rollback readiness.

## Rules

- Release PRs should include a rollback plan or the feature must be behind a kill-switch.
- Automate release steps in CI as much as possible and provide a documented manual rollback path.

## Checklist

- [ ] Is there an automated rollback or a documented manual rollback path?
- [ ] Can the release be disabled quickly via feature flag or configuration?
