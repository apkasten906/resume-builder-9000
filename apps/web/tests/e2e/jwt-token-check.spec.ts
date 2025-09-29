import { test } from './test-setup';
import { decode } from 'jsonwebtoken'; // This should be available in the project

// Import constants for URLs
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

/**
 * Test focused on JWT token analysis
 */
test('JWT token analysis', async ({ request }) => {
  console.log('Starting JWT token analysis test');

  // Step 1: Get a fresh token from the API
  const loginResponse = await request.post(`${API_BASE}/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: 'user@example.com',
      password: 'ValidPassword1!',
    },
  });

  console.log(`Login status: ${loginResponse.status()}`);

  if (loginResponse.ok()) {
    const data = await loginResponse.json();
    const token = data.token;
    console.log('Token received:', token);

    // Decode token to see payload (without verifying signature)
    try {
      const decodedToken = decode(token);
      console.log('Decoded token payload:', decodedToken);

      // Check for critical fields
      const now = Math.floor(Date.now() / 1000);
      console.log('Current timestamp:', now);

      if (typeof decodedToken === 'object' && decodedToken !== null) {
        // Check expiration
        const exp = decodedToken.exp;
        if (exp) {
          console.log(`Token expires at: ${exp} (${new Date(exp * 1000).toISOString()})`);
          console.log(`Token is ${exp < now ? 'EXPIRED' : 'still valid'}`);
        } else {
          console.log('Token has no expiration (exp) claim!');
        }

        // Check subject (user ID)
        const sub = decodedToken.sub;
        console.log(`Token subject (user ID): ${sub || 'MISSING'}`);

        // Check other claims
        console.log('All token claims:', Object.keys(decodedToken));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }

    // Try using the token with different formats

    // 1. As an Authorization header with Bearer prefix
    const bearerResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`/auth/me with Bearer token status: ${bearerResponse.status()}`);

    // 2. As an Authorization header without prefix
    const authResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: token },
    });
    console.log(`/auth/me with plain Authorization status: ${authResponse.status()}`);

    // 3. As a cookie
    const cookieResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: { Cookie: `session=${token}` },
    });
    console.log(`/auth/me with session cookie status: ${cookieResponse.status()}`);

    // If none of those worked, there might be a middleware issue
    if (!bearerResponse.ok() && !authResponse.ok() && !cookieResponse.ok()) {
      console.log('All authentication methods failed. Likely middleware configuration issue.');

      // Check what happens with an invalid endpoint
      const notFoundResponse = await request.get(`${API_BASE}/not-a-real-endpoint`);
      console.log(`Non-existent endpoint status: ${notFoundResponse.status()}`);

      // If this returns 401 instead of 404, it means the auth middleware runs before routing
    }
  } else {
    console.log('Login failed, cannot perform token analysis');
  }

  console.log('JWT token analysis test completed');
});
