# RB9K UX Implementation (Tailwind)

Follows the style guide: rounded-2xl, soft shadows, grid layouts, labeled inputs, inline errors.

## Components

- `apps/web/src/components/ui/*` (Button, Card, Input, Textarea, Badge, Tabs, Table)
- `apps/web/src/components/shell/AppShell.tsx`

## Pages (under apps/web/src/app)

- `/resume-upload` — drag/drop, validation, parse stub
- `/job-intake` — paste JD, parse stub
- `/tailor` — scoring threshold + badges; flag badge when AI on
- `/preview` — formatted preview + download stub
- `/applications` — table with filter
- `/settings` — AI tailoring toggle (UI only)

## Next steps

- Wire API routes for JD parsing, tailoring, download
- Replace stub data with repository calls
- Add toasts and more form helpers if desired
