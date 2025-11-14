'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Something went wrong
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try Again</Button>
        <Link href="/">
          <Button variant="secondary">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
