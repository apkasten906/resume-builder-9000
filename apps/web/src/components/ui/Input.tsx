'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, ...props }, ref) => {
    const id = React.useId();
    return (
      <label className="block">
        {label && <span className="block text-sm mb-1">{label}</span>}
        <input
          id={id}
          type={type}
          className={cn(
            'w-full border rounded-2xl px-3 py-2 bg-white dark:bg-zinc-900',
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
      </label>
    );
  }
);
Input.displayName = 'Input';

export { Input };
