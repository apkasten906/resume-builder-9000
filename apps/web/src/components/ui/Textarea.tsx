'use client';
import React from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, ...props }, ref): React.ReactElement => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    const base = cn(
      'w-full min-h-[120px] rounded-2xl border bg-background px-3 py-2',
      'text-foreground placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'border-input'
    );
    const err = 'border-destructive text-destructive focus-visible:ring-destructive';
    return (
      <div className="block">
        {label && (
          <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea id={id} className={cn(base, error && err, className)} ref={ref} {...props} />
        {!error && helperText && (
          <div className="mt-1 text-xs text-muted-foreground">{helperText}</div>
        )}
        {error && (
          <div className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
