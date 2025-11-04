# Observability & SLOs

## Purpose

Ensure services are instrumented and measurable so we can meet reliability and debugging goals.

## Rules

- Instrument key flows with structured logging, metrics, and distributed tracing.
- Define SLOs for core flows (e.g., resume-generation latency, API error rate) and monitor them in dashboards.
- Capture artifacts (traces, screenshots) for failing CI BDD/E2E tests to assist debugging.

## Checklist

- [ ] Are metrics and traces available for the new feature?
- [ ] Is there an SLO that covers the feature's critical path?
- [ ] Are CI artifacts captured on failure and stored in `playwright-report/` or equivalent?
