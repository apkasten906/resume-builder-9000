// apps/web/src/app/login/page.tsx
'use client';

import { useState, ReactElement } from 'react';
import { Input } from '@/components/ui/Input';

export default function LoginPage(): ReactElement {
  // Use default values for demo, but let the browser handle POST and navigation
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('ValidPassword1!');
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form method="POST" action="/api/auth/login" className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <button className="rounded-2xl shadow px-4 py-2" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
