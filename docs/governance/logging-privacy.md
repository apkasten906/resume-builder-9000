# Logging Privacy & Redaction

## Purpose

Prevent accidental leakage of PII or secrets through logs and ensure log retention policies are enforced.

## Rules

- Avoid logging raw PII fields (name, email, phone, national ID, resume text). Use identifiers or pseudonyms.
- Mark log levels conservatively for sensitive flows and ensure logs are collected to audited destinations.
- Implement redaction at the logging pipeline boundary (app or centralized collector).

## Checklist

- [ ] Have sensitive fields been identified and redaction implemented?
- [ ] Is the retention policy for logs documented and enforced?
