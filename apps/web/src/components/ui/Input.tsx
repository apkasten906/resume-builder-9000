'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, ...props }, ref): React.ReactElement => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    const inputBase = cn(
      'w-full rounded-2xl border bg-background px-3 py-2',
      'text-foreground placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'border-input'
    );
    const inputError = 'border-destructive text-destructive focus-visible:ring-destructive';
    return (
      <div className="block">
        {label && (
          <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(inputBase, error && inputError, className)}
          ref={ref}
          {...props}
        />
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
Input.displayName = 'Input';

export { Input };
