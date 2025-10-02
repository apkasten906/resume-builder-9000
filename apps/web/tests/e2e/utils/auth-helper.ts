// apps/web/tests/e2e/utils/auth-helper.ts
import type { Page } from '@playwright/test';

/**
 * Authentication helper for E2E tests
 * Provides utilities for setting up test users and managing auth tokens
 */

export interface TestUser {
  id: string;
  email: string;
  name?: string;
}

export class AuthHelper {
  private static readonly DEV_JWT_SECRET = 'dev-secret';

  /**
   * Creates a valid JWT token by logging in via API
   */
  static async createTestToken(): Promise<string> {
    const API_BASE = process.env.API_BASE || 'http://localhost:4000';

    try {
      // Log in via API to get a fresh token
      const apiResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'ValidPassword1!',
        }),
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        return data.token;
      } else {
        throw new Error(`Login failed: ${apiResponse.status} ${apiResponse.statusText}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to get auth token: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Sets up authentication for a test user in the browser
   */
  static async setupAuth(page: Page): Promise<void> {
    const token = await this.createTestToken();

    await page.addInitScript((token: string) => {
      window.localStorage.setItem('authToken', token);
    }, token);
  }

  /**
   * Creates a default test user
   */
  static createTestUser(suffix?: string): TestUser {
    const id = suffix || Date.now().toString();
    return {
      id: `test-user-${id}`,
      email: `test-${id}@example.com`,
      name: `Test User ${id}`,
    };
  }

  /**
   * Clears authentication from the browser
   */
  static async clearAuth(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.localStorage.removeItem('authToken');
    });
    await page.context().clearCookies();
  }

  /**
   * Verifies that authentication is properly set
   */
  static async verifyAuth(page: Page): Promise<boolean> {
    const token = await page.evaluate(() => {
      return window.localStorage.getItem('authToken');
    });
    return !!token;
  }
}
