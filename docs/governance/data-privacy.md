## Data Privacy & PII Handling

## Purpose

This short guidance documents how Resume Builder 9000 treats personal information (PII) and what engineering, operational, and documentation controls we require.

## Key rules

- Treat resume contents and related artifacts as PII by default.
- Minimize storage: keep only the minimum data necessary for feature functionality.
- Encrypt data at rest using platform-standard encryption (e.g., AES-256) and enforce TLS for data in transit.
- Redact PII from logs; log only identifiers or pseudonymized tokens when possible.
- Provide documented retention and erasure policies and honor user deletion requests within the SLA defined in the policy.

## Checklist (PRs / Features)

- [ ] Have you identified what PII the feature touches?
- [ ] Is there a documented retention period and erasure plan?
- [ ] Are logs redacted for sensitive fields? (name, email, phone, address, SSN equivalents)
- [ ] Are secrets and keys stored in a vault/GitHub Secrets rather than in code?

## Operational Notes

- Consider data minimization techniques (e.g., derived tokens, ephemeral storage) for transient processing flows like LLM prompts.
- Onboarding: ensure ops runbooks describe how to handle a data subject access request (DSAR).

## Related docs

- `docs/CI_CD.md` (secrets handling)
- `.github/instructions/security-and-owasp.instructions.md`
