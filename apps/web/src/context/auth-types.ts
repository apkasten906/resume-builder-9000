import { z } from 'zod';

export const MeResponseSchema = z.object({
  authenticated: z.boolean(),
  user: z
    .object({
      id: z.string(),
      email: z.string().email(),
      name: z.string().optional(),
      roles: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
});

export type MeResponse = z.infer<typeof MeResponseSchema>;

export interface AuthContextValue {
  authenticated: boolean;
  checking: boolean;
  /** Re-pulls /api/auth/me and updates context */
  refreshAuth: () => Promise<void>;
  /** Calls /api/auth/logout and refreshes auth */
  logout: () => Promise<void>;
}
