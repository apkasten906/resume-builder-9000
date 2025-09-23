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
    <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 mb-4">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={[
            'px-3 py-2 rounded-t-2xl',
            t === active
              ? 'bg-white dark:bg-zinc-900 shadow font-semibold'
              : 'hover:bg-gray-100 dark:hover:bg-zinc-800',
          ].join(' ')}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
