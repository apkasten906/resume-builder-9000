import * as React from 'react';
import { cn } from '@/lib/cn';

export function Card({
  className = '',
  children,
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return (
    <div className={cn('rounded-2xl shadow p-4 bg-white dark:bg-zinc-900', className)}>
      {children}
    </div>
  );
}
export function CardHeader({
  className = '',
  children,
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return <div className={cn('mb-3', className)}>{children}</div>;
}
export function CardTitle({
  className = '',
  children,
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>;
}
export function CardContent({
  className = '',
  children,
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return <div className={className}>{children}</div>;
}
