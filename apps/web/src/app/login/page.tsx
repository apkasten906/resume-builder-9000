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
  const { refreshAuth } = useAuth();

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setEmailError('');
    setPasswordError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        // Try to parse error response for field info
        let field = '';
        try {
          const data = await res.json();
          field = data?.field || '';
        } catch {
          // ignore parse errors, fallback to generic error
        }
        setError('Invalid email or password.');
        if (field === 'email') setEmailError('Invalid email');
        else if (field === 'password') setPasswordError('Invalid password');
        else {
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
      window.location.replace('/'); // Reload to Home page, context will refresh
    } catch {
      setError('Network error. Please try again.');
    }
  }

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
        <button className="rounded-2xl shadow px-4 py-2" type="submit">
          Sign in
        </button>
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
