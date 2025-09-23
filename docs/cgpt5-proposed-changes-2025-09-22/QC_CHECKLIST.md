# QC: Lint, Unit, E2E

## Lint

```bash
npm run lint
# or
pnpm -w run lint
```

## Unit tests (Vitest)

```bash
npx vitest run
# or
npm run test
```

## E2E (Playwright)

```bash
# 1) start API
npm --workspace=@rb9k/api run dev

# 2) start Web
export NEXT_PUBLIC_API_BASE=http://localhost:4000
npm --workspace=@rb9k/web run dev

# 3) run test
WEB_BASE=http://localhost:3000 npx playwright test apps/web/tests/e2e/login-flow.spec.ts
```
