import { test } from '@playwright/test';
// Removed unused import
import { decode } from 'jsonwebtoken'; // This should be available in the project
import { testLogger } from './utils/test-logger';

// Import constants for URLs
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

/**
 * Test focused on JWT token analysis
 */
test('JWT token analysis', async ({ request }) => {
  testLogger.log('Starting JWT token analysis test');

  // Step 1: Get a fresh token from the API
  const loginResponse = await request.post(`${API_BASE}/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: 'user@example.com',
      password: 'ValidPassword1!',
    },
  });

  testLogger.log(`Login status: ${loginResponse.status()}`);

  if (loginResponse.ok()) {
    const data = await loginResponse.json();
    const token = data.token;
    testLogger.log('Token received:', token);

    // In production, token won't be in response body for security
    if (!token) {
      testLogger.log('Token not in response body (production mode) - test skipped');
      return;
    }

    // Decode token to see payload (without verifying signature)
    try {
      const decodedToken = decode(token);
      testLogger.log('Decoded token payload:', decodedToken);

      // Check for critical fields
      const now = Math.floor(Date.now() / 1000);
      testLogger.log('Current timestamp:', now);

      if (typeof decodedToken === 'object' && decodedToken !== null) {
        // Check expiration
        const exp = decodedToken.exp;
        if (exp) {
          testLogger.log(`Token expires at: ${exp} (${new Date(exp * 1000).toISOString()})`);
          testLogger.log(`Token is ${exp < now ? 'EXPIRED' : 'still valid'}`);
        } else {
          testLogger.warn('Token has no expiration (exp) claim!');
        }

        // Check subject (user ID)
        const sub = decodedToken.sub;
        testLogger.log(`Token subject (user ID): ${sub || 'MISSING'}`);

        // Check other claims
        testLogger.log('All token claims:', Object.keys(decodedToken));
      }
    } catch (error) {
      testLogger.error('Error decoding token:', error);
    }

    // Try using the token with different formats

    // 1. As an Authorization header with Bearer prefix
    const bearerResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    testLogger.log(`/auth/me with Bearer token status: ${bearerResponse.status()}`);

    // 2. As an Authorization header without prefix
    const authResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: token },
    });
    testLogger.log(`/auth/me with plain Authorization status: ${authResponse.status()}`);

    // 3. As a cookie
    const cookieResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: { Cookie: `session=${token}` },
    });
    testLogger.log(`/auth/me with session cookie status: ${cookieResponse.status()}`);

    // If none of those worked, there might be a middleware issue
    if (!bearerResponse.ok() && !authResponse.ok() && !cookieResponse.ok()) {
      testLogger.warn('All authentication methods failed. Likely middleware configuration issue.');

      // Check what happens with an invalid endpoint
      const notFoundResponse = await request.get(`${API_BASE}/not-a-real-endpoint`);
      testLogger.log(`Non-existent endpoint status: ${notFoundResponse.status()}`);

      // If this returns 401 instead of 404, it means the auth middleware runs before routing
    }
  } else {
    testLogger.warn('Login failed, cannot perform token analysis');
  }

  testLogger.log('JWT token analysis test completed');
});

test.beforeAll(async () => {
  // TODO: Implement beforeAll logic
});

test.afterAll(async () => {
  // TODO: Implement afterAll logic
});

test.beforeEach(async () => {
  // TODO: Implement beforeEach logic
});

test.afterEach(async () => {
  // TODO: Implement afterEach logic
});
