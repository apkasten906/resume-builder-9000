# Migrations, Backups & Data Migration Policy

## Purpose

Ensure schema and data migrations are applied safely and that rollback options and backups are available.

## Rules

- Ensure migrations are reversible or provide an explicit rollback plan.
- Run migrations in a staging environment that mirrors production prior to rollout.
- Take backups (snapshot or DB dump) before applying production migrations.
- Coordinate migration windows for actions with potential downtime.

## Checklist

- [ ] Is the migration reversible or accompanied by a rollback plan?
- [ ] Has the migration been run in staging and verified?
- [ ] Is a backup snapshot available for the production database prior to rollout?

## Operational notes

- Document migration steps in the PR and add a runbook for the ops team.
