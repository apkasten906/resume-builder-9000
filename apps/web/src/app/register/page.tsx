// apps/web/src/app/register/page.tsx
'use client';

import { useState, ReactElement } from 'react';
import { Input } from '@/components/ui/Input';

const PASSWORD_GUIDELINES = [
  'At least 8 characters',
  'At least one uppercase letter',
  'At least one lowercase letter',
  'At least one number',
  'At least one special character (!@#$%^&*)',
];

export default function RegisterPage(): ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function validatePassword(pw: string): boolean {
    // OWASP password policy
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[!@#$%^&*]/.test(pw)
    );
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError(null);
    if (!validatePassword(password)) {
      setError('Password does not meet security requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // TODO: Implement registration API call
    alert('Registration submitted!');
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <div className="text-sm text-gray-600 mb-2">
          <strong>Password must include:</strong>
          <ul className="list-disc ml-6">
            {PASSWORD_GUIDELINES.map(g => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button className="rounded-2xl shadow px-4 py-2" type="submit">
          Register
        </button>
      </form>
      <div className="mt-6 text-center">
        <span className="text-gray-600">Already have an account?</span>
        <a href="/login" className="ml-2 text-blue-600 hover:underline font-semibold">
          Sign in
        </a>
      </div>
    </div>
  );
}
