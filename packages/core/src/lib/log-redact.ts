// Lightweight log redaction helpers for PII
export function redactString(s: string | undefined): string | undefined {
  if (!s) return s;
  // mask email addresses
  const emailRegex = /([\w.+-]+)@([\w.-]+)/;
  if (emailRegex.test(s)) return s.replace(emailRegex, (m, p1, p2) => `${p1[0]}***@${p2}`);

  // mask phone numbers (simple)
  const phoneRegex = /\+?\d[\d ()-]{6,}\d/;
  if (phoneRegex.test(s))
    return s.replace(phoneRegex, match => match.slice(0, 2) + '***REDACTED***');

  // long strings
  if (s.length > 200) return s.slice(0, 100) + '...<redacted>...';
  return s;
}

export function redact(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') return redactString(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => redact(item));
  }

  if (typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      if (typeof val === 'string') out[key] = redactString(val);
      else out[key] = redact(val);
    }
    return out;
  }

  // primitives (number, boolean, symbol, function) - return as-is
  return obj;
}

export default { redact, redactString };
