import * as React from 'react';
import { cn } from '@/lib/cn';
export function Badge({
  children,
  className = '',
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-200 text-gray-900 dark:bg-zinc-800 dark:text-gray-100',
        className
      )}
    >
      {children}
    </span>
  );
}
