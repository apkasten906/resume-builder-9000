import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

const DEFAULT_ROUNDS = 10;
const DERIVED_KEY_LENGTH = 32;
const ITERATIONS = 100_000;
const DIGEST = 'sha256';

function generateSalt(rounds?: number): string {
  const entropy = Math.max(DEFAULT_ROUNDS, typeof rounds === 'number' ? rounds : DEFAULT_ROUNDS);
  return randomBytes(entropy).toString('hex');
}

function formatHash(salt: string, digest: string): string {
  return `${salt}$${digest}`;
}

function deriveHash(value: string, salt: string): string {
  return pbkdf2Sync(value, salt, ITERATIONS, DERIVED_KEY_LENGTH, DIGEST).toString('hex');
}

function parseHash(value: string): { salt: string; digest: string } | null {
  const parts = value.split('$');
  if (parts.length !== 2) {
    return null;
  }
  const [salt, digest] = parts;
  if (!salt || !digest) {
    return null;
  }
  return { salt, digest };
}

async function hash(value: string, saltOrRounds: string | number): Promise<string> {
  const salt = typeof saltOrRounds === 'string' ? saltOrRounds : generateSalt(saltOrRounds);
  const digest = deriveHash(value, salt);
  return formatHash(salt, digest);
}

function hashSync(value: string, saltOrRounds: string | number): string {
  const salt = typeof saltOrRounds === 'string' ? saltOrRounds : generateSalt(saltOrRounds);
  const digest = deriveHash(value, salt);
  return formatHash(salt, digest);
}

function compareInternal(value: string, hashed: string): boolean {
  const parsed = parseHash(hashed);
  if (!parsed) {
    return false;
  }
  const digest = deriveHash(value, parsed.salt);
  return timingSafeEqual(Buffer.from(parsed.digest, 'hex'), Buffer.from(digest, 'hex'));
}

async function compare(value: string, hashed: string): Promise<boolean> {
  return compareInternal(value, hashed);
}

function compareSync(value: string, hashed: string): boolean {
  return compareInternal(value, hashed);
}

async function genSalt(rounds?: number): Promise<string> {
  return generateSalt(rounds);
}

function genSaltSync(rounds?: number): string {
  return generateSalt(rounds);
}

export default {
  hash,
  hashSync,
  compare,
  compareSync,
  genSalt,
  genSaltSync,
};

export { hash, hashSync, compare, compareSync, genSalt, genSaltSync };
