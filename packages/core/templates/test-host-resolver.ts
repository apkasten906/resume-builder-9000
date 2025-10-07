// test-host-resolver.ts
/**
 * Utility to resolve host address for integration/e2e tests
 * Ensures consistent host resolution across all test templates
 */
export function getTestHost(): string {
  return process.env.TEST_HOST || 'http://localhost:4000';
}
