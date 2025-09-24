'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, ...props }, ref) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    return (
      <div className="block">
        {label ? (
          <label htmlFor={id} className="block text-sm mb-1">
            {label}
          </label>
        ) : null}
        <textarea
          id={id}
          className={cn(
            'w-full min-h-[120px] border rounded-2xl px-3 py-2 bg-white dark:bg-zinc-900',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          ref={ref}
          {...props}
        />
        {!error && helperText && <div className="text-xs text-gray-500 mt-1">{helperText}</div>}
        {error && (
          <div className="text-xs text-red-600 mt-1" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
