# Type Safety & API Contracts

We use **explicit, end-to-end typing** across the monorepo. All exported functions **must** declare explicit return types.

## Requirements

- **Explicit return types** for all exported functions, public class methods, route handlers, and React components.
- Prefer **type-only imports/exports** for domain types: `import type { Application } from '@rb9k/core'`.
- Validate edge I/O with **zod** (or equivalent) and derive types with `z.infer`.
- Domain shapes come from `@rb9k/core` (no ad-hoc shapes near controllers/UI).

## Examples

```ts
// API controller (Express)
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { Application } from '@rb9k/core';

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
});
type CreateApplicationInput = z.infer<typeof createSchema>;

export async function createApplication(req: Request, res: Response): Promise<void> {
  const input: CreateApplicationInput = createSchema.parse(req.body);
  const created: Application = await appService.create(input);
  res.status(201).json(created);
}
```

```ts
// Next.js route handler
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ text: z.string().min(10) });
type ParseInput = z.infer<typeof schema>;
type ParseResult = { title: string; company: string; keywords: string[] };

export async function POST(req: NextRequest): Promise<NextResponse<ParseResult>> {
  const body = schema.parse(await req.json()) as ParseInput;
  const result: ParseResult = await parseJD(body);
  return NextResponse.json(result, { status: 200 });
}
```

```tsx
// React component
export default function ApplicationsPage(): JSX.Element {
  return <main>{/* … */}</main>;
}
```

## Compiler settings

`tsconfig` (workspace-inherited):

- `"strict": true`
- `"noImplicitAny": true`
- `"noImplicitReturns": true`
- `"exactOptionalPropertyTypes": true`
- `"noUncheckedIndexedAccess": true`

## Lint rules

- `@typescript-eslint/explicit-function-return-type`: **error**
- `@typescript-eslint/explicit-module-boundary-types`: **error**
- `@typescript-eslint/consistent-type-imports`: **error**
- `@typescript-eslint/no-explicit-any`: **error** (allow exceptions with comments if necessary)

> See `eslint/patches/*` for ready-to-merge rule snippets.
