# Dependency Upgrade Policy

## Purpose

Provide a predictable policy for managing dependency upgrades and security patches.

## Rules

- Maintain an upgrade cadence (e.g., weekly or monthly) with automated PRs for minor/patch upgrades.
- Run SCA and SAST checks in CI for each dependency PR.
- Emergency high-severity fixes are allowed with an attached remediation timeline and tests.

## Checklist

- [ ] Was the upgrade tested in staging?
- [ ] Are SCA/SAST scans clean or have mitigations documented?
