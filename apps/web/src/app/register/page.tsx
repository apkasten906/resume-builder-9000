'use client';

import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { evaluatePassword } from '@rb9k/core';
import { Input } from '@/components/ui/Input';

const steps = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'profile', label: 'Profile' },
] as const;

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface FormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  general: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage(): ReactElement {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    general: '',
  });
  const [serverUnmetRules, setServerUnmetRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedRegistration, setCompletedRegistration] = useState<{
    email: string;
    expiresAt?: string;
  } | null>(null);

  const passwordEvaluation = useMemo(
    () => evaluatePassword(formValues.password || ''),
    [formValues.password]
  );
  const requirementStatuses = useMemo(() => {
    return passwordEvaluation.requirements.map(requirement => ({
      ...requirement,
      met: requirement.met && !serverUnmetRules.includes(requirement.id),
    }));
  }, [passwordEvaluation, serverUnmetRules]);

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    if (field === 'password') {
      setServerUnmetRules([]);
    }
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const updatedErrors: FormErrors = { ...errors, general: '' };
      let hasError = false;

      if (step === 0) {
        updatedErrors.email = '';
        const trimmedEmail = formValues.email.trim();
        if (!trimmedEmail) {
          updatedErrors.email = 'Email is required';
          hasError = true;
        } else if (!emailRegex.test(trimmedEmail)) {
          updatedErrors.email = 'Enter a valid email address';
          hasError = true;
        }
      }

      if (step === 1) {
        updatedErrors.password = '';
        updatedErrors.confirmPassword = '';

        if (!passwordEvaluation.valid) {
          updatedErrors.password = 'Password must meet all requirements';
          hasError = true;
        }
        if (!formValues.confirmPassword) {
          updatedErrors.confirmPassword = 'Confirm your password';
          hasError = true;
        } else if (formValues.password !== formValues.confirmPassword) {
          updatedErrors.confirmPassword = 'Passwords must match';
          hasError = true;
        }
      }

      if (step === 2) {
        updatedErrors.fullName = '';
        if (!formValues.fullName.trim()) {
          updatedErrors.fullName = 'Please share your name';
          hasError = true;
        }
      }

      setErrors(updatedErrors);
      return !hasError;
    },
    [errors, formValues, passwordEvaluation]
  );

  const goToNextStep = useCallback(() => {
    const valid = validateStep(currentStep);
    if (valid) {
      setServerUnmetRules([]);
      setCurrentStep(step => Math.min(step + 1, steps.length - 1));
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setErrors(prev => ({ ...prev, general: '' }));
    setServerUnmetRules([]);
    setCurrentStep(step => Math.max(0, step - 1));
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (currentStep < steps.length - 1) {
        goToNextStep();
        return;
      }

      if (!validateStep(currentStep)) {
        return;
      }

      setLoading(true);
      setErrors(prev => ({ ...prev, general: '' }));
      setServerUnmetRules([]);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formValues.email.trim(),
            password: formValues.password,
            confirmPassword: formValues.confirmPassword,
            fullName: formValues.fullName.trim(),
          }),
        });

        const data = await response.json().catch(err => {
          // Only log parsing errors in non-production environments
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to parse JSON response:', err);
          }
          return { error: 'Invalid response from server', parseError: true };
        });

        if (!response.ok) {
          const message = typeof data?.error === 'string' ? data.error : 'Registration failed';
          const field = data?.field as keyof FormErrors | undefined;
          const unmet = Array.isArray(data?.unmet) ? (data.unmet as string[]) : [];

          setErrors(prev => {
            const next = { ...prev };
            if (!field || field === 'general') {
              next.general = message;
            } else {
              next.general = '';
              next[field] = message;
            }
            return next;
          });

          if (field === 'password' || field === 'confirmPassword') {
            setCurrentStep(1);
          } else if (field === 'fullName') {
            setCurrentStep(2);
          } else if (field === 'email') {
            setCurrentStep(0);
          }

          if (unmet.length > 0) {
            setServerUnmetRules(unmet);
          }

          return;
        }

        setErrors({ email: '', password: '', confirmPassword: '', fullName: '', general: '' });
        setCompletedRegistration({
          email: formValues.email.trim(),
          expiresAt:
            typeof data?.verification?.expiresAt === 'string'
              ? data.verification.expiresAt
              : undefined,
        });
      } catch {
        setErrors(prev => ({ ...prev, general: 'Network error. Please try again.' }));
      } finally {
        setLoading(false);
      }
    },
    [currentStep, formValues, goToNextStep, validateStep]
  );

  if (completedRegistration) {
    const expiresLabel = completedRegistration.expiresAt
      ? new Date(completedRegistration.expiresAt).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })
      : null;

    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Check your email</h1>
        <p className="mt-4 text-base text-muted-foreground">
          We sent a confirmation link to{' '}
          <span className="font-semibold text-foreground">{completedRegistration.email}</span>.{' '}
          Follow the link to activate your account before signing in.
        </p>
        <div className="mt-6 rounded-xl border border-muted bg-muted/20 p-6">
          <h2 className="text-lg font-semibold text-foreground">What happens next?</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Open the email and click the confirmation button.</li>
            <li>
              The link expires {expiresLabel ? `around ${expiresLabel}` : 'in 30 minutes'}. If it
              expires, you can request a new one from the login page.
            </li>
            <li>Once confirmed, sign in with your email and password.</li>
          </ul>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Ready to sign in?
          <a href="/login" className="ml-2 font-semibold text-blue-600 hover:underline">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We just need a few details to get you into your workspace. You can update your profile at
        any time.
      </p>

      <ol className="mt-8 flex items-center gap-4" aria-label="Registration progress">
        {steps.map((step, index) => {
          const active = index === currentStep;
          const complete = index < currentStep;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  complete
                    ? 'bg-blue-600 text-white'
                    : active
                      ? 'border-2 border-blue-600 text-blue-600'
                      : 'border border-muted text-muted-foreground'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {index + 1}
              </div>
              <span
                className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`h-px flex-1 ${complete ? 'bg-blue-600' : 'bg-muted'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        {currentStep === 0 && (
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formValues.email}
              onChange={event => updateField('email', event.target.value)}
              autoComplete="username"
              required
              error={errors.email}
            />
            <p className="text-sm text-muted-foreground">
              We will send confirmation updates to this address. You can change it later in your
              settings.
            </p>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formValues.password}
              onChange={event => updateField('password', event.target.value)}
              autoComplete="new-password"
              required
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formValues.confirmPassword}
              onChange={event => updateField('confirmPassword', event.target.value)}
              autoComplete="new-password"
              required
              error={errors.confirmPassword}
            />

            <div className="rounded-xl border border-muted bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">Password must include:</p>
              <ul className="mt-2 space-y-1 text-sm" aria-live="polite">
                {requirementStatuses.map(requirement => (
                  <li
                    key={requirement.id}
                    className={requirement.met ? 'text-emerald-600' : 'text-muted-foreground'}
                  >
                    {requirement.met ? '✓' : '•'} {requirement.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formValues.fullName}
              onChange={event => updateField('fullName', event.target.value)}
              autoComplete="name"
              required
              error={errors.fullName}
            />
            <div className="rounded-xl border border-muted bg-muted/20 p-4">
              <h2 className="text-sm font-semibold text-foreground">Review</h2>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium text-foreground">{formValues.email.trim()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground">
                    {formValues.fullName.trim() || 'Not provided'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Password</dt>
                  <dd className="font-medium text-foreground">Hidden for your security</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {errors.general && (
          <div
            className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            {errors.general}
          </div>
        )}

        <div className="flex items-center justify-between">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              Back
            </button>
          ) : (
            <span aria-hidden="true" />
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="rounded-2xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              disabled={loading}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?
        <a href="/login" className="ml-2 font-semibold text-blue-600 hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
