// apps/web/src/app/applications/page.tsx
import { ReactElement } from 'react';

export default function ApplicationsPage(): ReactElement {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>
      <div className="grid gap-4">
        <div className="rounded-2xl shadow p-4">No applications yet.</div>
      </div>
    </main>
  );
}
