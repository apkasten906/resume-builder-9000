// apps/web/src/app/login/page.tsx
'use client';

import { useState, ReactElement } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';

export default function LoginPage(): ReactElement {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('ValidPassword1!');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showResendButton, setShowResendButton] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { refreshAuth } = useAuth();

  // NOTE: we intentionally do NOT persist `showResendButton` to localStorage.
  // The resend link should only appear in response to a failed login attempt
  // (e.g. HTTP 403 requiring email verification) during the current session.

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setEmailError('');
    setPasswordError('');
    // Reset resend UI on every new submit; only show it if backend indicates it's needed
    setShowResendButton(false);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Try to parse error response for field info
        const field = typeof data?.field === 'string' ? data.field : '';
        const message =
          typeof data?.error === 'string'
            ? data.error
            : res.status === 403
              ? 'Please confirm your email before signing in.'
              : 'Invalid email or password.';
        console.log('Login failed:', {
          status: res.status,
          requiresEmailConfirmation: data?.requiresEmailConfirmation,
        });
        setError(message);
        if (res.status === 403 || data?.requiresEmailConfirmation) {
          setEmailError('Email not verified');
          setPasswordError('');
          setShowResendButton(true);
        } else if (field === 'email') {
          setEmailError('Invalid email');
          setPasswordError('');
        } else if (field === 'password') {
          setPasswordError('Invalid password');
          setEmailError('');
        } else {
          setEmailError('Invalid email');
          setPasswordError('Invalid password');
        }
        // Do NOT redirect on failed login
        return;
      }
      // Only redirect if refreshAuth confirms authentication
      await refreshAuth();
      setError(null);
      setEmailError('');
      setPasswordError('');
      // Redirect to hero after successful login
      window.location.replace('/');
    } catch {
      setError('Network error. Please try again.');
    }
  }

  const handleResendVerification = async (): Promise<void> => {
    try {
      setError(null);
      setSuccessMessage('');
      // disable the resend button while the request is in-flight
      setShowResendButton(false);
      // Call the backend resend/verify-email endpoint
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to resend verification email.');
        return;
      }
      setSuccessMessage(data.message || 'Verification email resent successfully.');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError('Failed to resend verification email. Please try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
          error={emailError}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          error={passwordError}
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {showResendButton && (
          <div className="mb-2">
            <button
              type="button"
              onClick={handleResendVerification}
              data-testid="resend-verification"
              className="text-blue-600 hover:underline"
            >
              Resend Verification Email
            </button>
          </div>
        )}
        <button className="rounded-2xl shadow px-4 py-2" type="submit">
          Sign in
        </button>
        {/* success message shown near the form so there's exactly one place for resend-related UI */}
        {successMessage && <div className="text-green-600 mt-2">{successMessage}</div>}
      </form>
      <div className="mt-6 text-center">
        <span className="text-gray-600">Don't have an account?</span>
        <a href="/register" className="ml-2 text-blue-600 hover:underline font-semibold">
          Register
        </a>
      </div>
    </div>
  );
}
