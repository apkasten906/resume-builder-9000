import { MeResponseSchema, type MeResponse } from '@/context/auth-types';

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Omit<NonNullable<Parameters<typeof fetch>[1]>, 'credentials'>;

async function safeJson<T>(r: Response): Promise<T> {
  const text = await r.text();
  if (!text) throw new Error('Empty response');
  return JSON.parse(text) as T;
}

/** Fetch /api/auth/me with validation */
export async function fetchMe(): Promise<MeResponse | null> {
  const r = await fetch('/api/auth/me', { credentials: 'include' });
  if (!r.ok) return null;
  const data = await safeJson<unknown>(r);
  const parsed = MeResponseSchema.safeParse(data);
  if (!parsed.success) return null;
  return parsed.data;
}

/** POST /api/auth/logout; ignore payload, rely on cookie clear */
export async function postLogout(init?: FetchInit): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    ...(init ?? {}),
  });
}

/** A tiny wrapper you can reuse elsewhere when hitting your API routes */
export async function getJson<T>(input: FetchInput, init?: FetchInit): Promise<T> {
  const r = await fetch(input, { credentials: 'include', ...(init ?? {}) });
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return safeJson<T>(r);
}
