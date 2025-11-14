import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Sorry, the page you are looking for does not exist. It may have been moved or deleted.
      </p>
      <Link href="/">
        <Button variant="secondary">Return Home</Button>
      </Link>
    </div>
  );
}
