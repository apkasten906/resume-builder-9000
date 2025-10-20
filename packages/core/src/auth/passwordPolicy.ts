// packages/core/src/auth/passwordPolicy.ts
import { z } from 'zod';

export interface PasswordRequirement {
  /**
   * Stable identifier for the requirement so callers can map backend responses
   * or analytics events to a specific rule.
   */
  readonly id: string;
  /** Human-friendly description that can be rendered in UIs. */
  readonly label: string;
  /** Predicate that determines whether the requirement is satisfied. */
  readonly test: (password: string) => boolean;
}

export const PASSWORD_POLICY_RULES: readonly PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least twelve characters',
    test: (password: string): boolean => password.length >= 12,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (password: string): boolean => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (password: string): boolean => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (password: string): boolean => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'At least one special character (e.g. !@#$%^&*)',
    test: (password: string): boolean => /[^A-Za-z0-9]/.test(password),
  },
  {
    id: 'noCommon',
    label: 'Does not contain common weak patterns',
    test: (password: string): boolean => {
      const normalized = password.toLowerCase();

      // Block common weak password patterns using direct literal strings for clarity.
      // These are well-known weak passwords that should be blocked for security.
      const patterns: RegExp[] = [
        /password123/,
        /passw0rd/,
        /qwerty/,
        /letmein/,
        /\b123456\b/,
        /welcome/,
      ];

      return !patterns.some(rx => rx.test(normalized));
    },
  },
];

export interface PasswordValidationResult {
  /** True when every requirement has been satisfied. */
  readonly valid: boolean;
  /**
   * Detailed evaluation for each requirement to power UI checklists.
   */
  readonly requirements: ReadonlyArray<PasswordRequirementStatus>;
  /**
   * Number between 0 and 1 that callers can use to build strength meters.
   */
  readonly score: number;
}

export interface PasswordRequirementStatus {
  readonly id: string;
  readonly label: string;
  readonly met: boolean;
}

const passwordSchema = z.string().max(256, 'Password must be 256 characters or fewer');

/**
 * Evaluate a password against the canonical security policy for the
 * application. The same policy is consumed by the backend, frontend, and tests
 * to keep behaviour consistent across layers.
 */
export function evaluatePassword(password: string): PasswordValidationResult {
  const sanitized = passwordSchema.parse(password);

  const results = PASSWORD_POLICY_RULES.map<PasswordRequirementStatus>(
    (rule): PasswordRequirementStatus => ({
      id: rule.id,
      label: rule.label,
      met: rule.test(sanitized),
    })
  );

  const metCount = results.filter(result => result.met).length;
  const score = results.length === 0 ? 0 : metCount / results.length;

  return {
    valid: results.every(result => result.met),
    requirements: results,
    score,
  };
}

/**
 * Convenience helper when callers only care about the boolean verdict.
 */
export function validatePassword(password: string): boolean {
  return evaluatePassword(password).valid;
}
