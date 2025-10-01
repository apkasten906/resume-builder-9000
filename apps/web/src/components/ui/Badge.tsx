import * as React from 'react';
import { cn } from '@/lib/cn';

export function Badge({
  children,
  className = '',
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs',
        'bg-secondary text-secondary-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}
