'use client';
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-ring',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring',
  ghost: 'bg-transparent hover:bg-accent text-foreground focus-visible:ring-ring',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild, ...props }, ref): React.ReactElement => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex select-none items-center justify-center rounded-2xl shadow-soft',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-background',
          'disabled:opacity-50 disabled:pointer-events-none transition',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
