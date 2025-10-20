'use client';

import { Suspense, useEffect, useState, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';

type VerificationState =
  | { status: 'loading' }
  | { status: 'success'; email?: string }
  | { status: 'error'; message: string };

function ConfirmEmailContent(): ReactElement {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>({ status: 'loading' });

  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    if (!tokenParam) {
      setState({
        status: 'error',
        message: 'Verification token is missing. Please use the link from your email.',
      });
      return;
    }

    async function verify(currentToken: string): Promise<void> {
      setState({ status: 'loading' });
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(currentToken)}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            typeof data?.error === 'string'
              ? data.error
              : response.status === 410
                ? 'This verification link has expired. Request a new one from the login page.'
                : 'We could not verify your email. Please try again.';
          setState({ status: 'error', message });
          return;
        }

        setState({ status: 'success', email: data?.user?.email });
      } catch {
        setState({
          status: 'error',
          message: 'We could not verify your email. Please try again.',
        });
      }
    }

    void verify(tokenParam);
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Email verification</h1>
      {state.status === 'loading' && (
        <p className="mt-4 text-base text-muted-foreground">
          We are confirming your account. This usually takes just a moment…
        </p>
      )}
      {state.status === 'success' && (
        <div className="mt-6 space-y-4">
          <p className="text-base text-muted-foreground">
            Thanks! We confirmed{' '}
            {state.email ? (
              <strong className="text-foreground">{state.email}</strong>
            ) : (
              'your account'
            )}
            . You can sign in right away.
          </p>
          <a
            href="/login"
            data-testid="confirm-email-go-login"
            className="inline-flex rounded-2xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Go To Login
          </a>
        </div>
      )}
      {state.status === 'error' && (
        <div className="mt-6 space-y-4">
          <p className="text-base text-destructive">{state.message}</p>
          <a
            href="/"
            className="inline-flex rounded-2xl border border-muted px-6 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Back to home
          </a>
        </div>
      )}
    </div>
  );
}

export default function ConfirmEmailPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-6 py-16 text-base text-muted-foreground">
          We are confirming your account…
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
