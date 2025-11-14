'use client';
import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#DC2626', fontSize: '3rem', marginBottom: '1rem' }}>Error</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '2rem', color: '#6B7280' }}>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#E5E7EB',
                color: '#1F2937',
                border: 'none',
                borderRadius: '0.25rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
