// Centralized test environment detection utility
export function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.PLAYWRIGHT_TEST === 'true' ||
    process.env.DEV_E2E_TEST === 'true'
  );
}
