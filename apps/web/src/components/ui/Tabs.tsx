'use client';
import React from 'react';

export function Tabs({
  tabs,
  active,
  onChange,
}: Readonly<{
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}>): React.ReactElement {
  return (
    <div className="mb-4 flex gap-2 border-b border-[hsl(var(--border))]">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={[
            'rounded-t-2xl px-3 py-2 transition',
            t === active ? 'bg-card shadow text-foreground' : 'hover:bg-muted',
          ].join(' ')}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
