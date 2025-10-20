/**
 * Environment variable loading - must be imported FIRST before any other modules
 * This ensures .env files are loaded before any code that uses process.env
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables. Prefer the repository root .env when present so
// a developer can set ENABLE_TEST_ROUTES / TEST_ROUTE_SECRET at the repo level
// and have all workspace packages pick it up in development.
try {
  const repoRoot = path.resolve(__dirname, '../../..');
  const rootEnv = path.join(repoRoot, '.env');
  if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
    console.log('📁 Loaded environment from:', rootEnv);
  } else {
    dotenv.config();
    console.log('📁 Loaded environment from default location');
  }
} catch (err) {
  // Fallback to default behavior
  dotenv.config();
  console.log('📁 Loaded environment (fallback)');
}

// Also load .env.local if it exists (takes precedence)
try {
  const localEnv = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(localEnv)) {
    dotenv.config({ path: localEnv, override: true });
    console.log('📁 Loaded local environment overrides from:', localEnv);
  }
} catch (err) {
  // Ignore errors
}

// Debug output
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Environment Configuration:');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log(
    '  RESEND_API_KEY:',
    process.env.RESEND_API_KEY
      ? '✓ Set (length: ' + process.env.RESEND_API_KEY.length + ')'
      : '✗ Not set'
  );
  console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '✗ Not set');
}
