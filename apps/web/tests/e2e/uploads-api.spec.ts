import { test, expect } from '@playwright/test';

const webUrl = process.env.WEB_BASE || 'http://localhost:3000';

test.describe('Dashboard Resume Uploads API', () => {
  test('should return uploaded resumes from /api/uploads', async ({ request }) => {
    const res = await request.get(`${webUrl}/api/uploads`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.items)).toBe(true);
    if (data.items.length > 0) {
      expect(data.items[0]).toHaveProperty('fileName');
      expect(data.items[0]).toHaveProperty('lastUpdated');
      expect(data.items[0]).toHaveProperty('id');
    }
  });

  // Removed backend connectivity test: focus on meaningful e2e integration
});
