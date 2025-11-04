import { createHmac, timingSafeEqual } from 'crypto';

type SignInput = Record<string, unknown>;

interface SignOptions {
  expiresIn?: string | number;
}

function encode(payload: SignInput): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function parseExpiresIn(value: string | number | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value * 1000;
  }
  if (typeof value === 'string') {
    const match = value.match(/^(\d+)([smhd])$/i);
    if (match) {
      const amount = Number(match[1]);
      const unit = match[2].toLowerCase();
      const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
      return amount * multiplier * 1000;
    }
  }
  return 7 * 24 * 3600 * 1000; // default 7 days
}

function sign(payload: SignInput, secret: string, options?: SignOptions): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const ttl = parseExpiresIn(options?.expiresIn);
  const exp = Math.floor((now + ttl) / 1000);
  const body = { ...payload, exp };

  const headerSegment = encode(header);
  const payloadSegment = encode(body);
  const base = `${headerSegment}.${payloadSegment}`;
  const signature = createHmac('sha256', secret).update(base).digest('base64url');
  return `${base}.${signature}`;
}

function decodeSegment(segment: string): SignInput {
  const json = Buffer.from(segment, 'base64url').toString('utf8');
  return JSON.parse(json) as SignInput;
}

function verify(token: string, secret: string): SignInput {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('invalid token');
  }
  const [headerSegment, payloadSegment, signature] = parts;
  const base = `${headerSegment}.${payloadSegment}`;
  const expected = createHmac('sha256', secret).update(base).digest('base64url');
  if (!timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'))) {
    throw new Error('invalid signature');
  }
  const payload = decodeSegment(payloadSegment);
  const exp = typeof payload.exp === 'number' ? payload.exp : undefined;
  if (typeof exp === 'number' && Date.now() >= exp * 1000) {
    throw new Error('jwt expired');
  }
  return payload;
}

export default { sign, verify };
export { sign, verify };
