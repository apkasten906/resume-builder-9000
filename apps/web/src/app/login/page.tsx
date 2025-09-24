// apps/web/src/app/login/page.tsx
'use client';

import { useState, ReactElement } from 'react';
import { Input } from '@/components/ui/Input';

export default function LoginPage(): ReactElement {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('ValidPassword1!');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed');
    } else {
      window.location.href = '/applications';
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && (
          <div className="text-red-600" role="alert">
            {error}
          </div>
        )}
        <button className="rounded-2xl shadow px-4 py-2">Sign in</button>
      </form>
    </div>
  );
}
