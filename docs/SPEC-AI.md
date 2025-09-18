# Resume Builder 9000 — SPEC-AI (Optional, Behind Feature Flag)

> This file is only applicable when `ALLOW_EXTERNAL_LLM=true`. The deterministic core remains the source of truth.

## Flag & Provider

- `ALLOW_EXTERNAL_LLM=true`
- `LLM_PROVIDER=anthropic`
- `LLM_MODEL=claude-3.7-sonnet`

## Interface

Implement `LLMTextIntelligence` fulfilling:

- `extractJobProfile(raw: string): JobProfile`
- `rewriteBullet(a: Achievement, job: JobProfile, style: Style): string`

## Resume Upload Flow (AI Mode)

- Resume upload UI and API (`POST /api/resumes/parse`) are identical to deterministic mode.
- Parsed preview contract: `{ summary, experience, skills }`.
- If LLM is enabled, downstream tailoring and bullet rewriting may use LLM for normalization and phrasing, but upload/parse/validation is always deterministic.

## Guardrails

- Temperature ≤ 0.3, max single-sentence length 180 chars (post-trim).
- **No metric fabrication**: if no metric detected in source, produce qualitative outcome.
- Do not introduce skills not present in achievements (except synonyms).
- Locale/style obeys `Style` object.

## Prompts

### P1 — JD Intelligence Extraction (JSON only)

**System**: You are a job-post parser. Output strict JSON only, no prose.

**User**: <raw JD text>

**Output Schema**:

```json
{
  "job_title": "",
  "seniority": "",
  "location": "",
  "must_haves": [],
  "nice_to_haves": [],
  "soft_signals": ["leadership", "compliance", "ambiguity_tolerance"]
}
```

### P2 — Achievement Normalization

**System**: Extract action verb, skills, any numeric metric, and qualitative outcome. Do not invent numbers.

**User**: <raw bullet text>

**Output**:

```json
{
  "action_verb": "",
  "skills": [""],
  "metric": { "type": "", "value": "", "unit": "" },
  "outcome": "",
  "seniority_tag": ""
}
```

### P3 — Bullet Rewriter

**System**: Rewrite to mirror JD vocabulary while keeping facts. One sentence, ≤ 180 chars. Use qualitative phrasing if no metric. Respect tense and region.

**User**: normalized achievement JSON + JobProfile JSON + style

### P4 — Summary

2–3 lines referencing 2–3 must-haves and one domain keyword, no fluff.

## Failure Modes & Handling

- If extraction fails, fall back to deterministic parser.
- On 429/5xx, retry with backoff; never block the pipeline (use deterministic path).
