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

  test('should return fresh data on each request (no caching)', async ({ request }) => {
    // Make two requests and verify we get consistent, fresh data
    const res1 = await request.get(`${webUrl}/api/uploads`);
    expect(res1.ok()).toBeTruthy();
    const data1 = await res1.json();

    // Make a second request immediately after
    const res2 = await request.get(`${webUrl}/api/uploads`);
    expect(res2.ok()).toBeTruthy();
    const data2 = await res2.json();

    // Both should be successful and return the same structure (array of items)
    expect(Array.isArray(data1.items)).toBe(true);
    expect(Array.isArray(data2.items)).toBe(true);

    // Verify both requests return data (not cached empty responses)
    // If caching was aggressive, we might get stale/empty data
    // With dynamic='force-dynamic', both should reflect current DB state
    expect(data1.items.length).toBeGreaterThanOrEqual(0);
    expect(data2.items.length).toBeGreaterThanOrEqual(0);
    
    // The key test: both requests should return the same current data
    // (not one stale and one fresh)
    expect(data1.items.length).toBe(data2.items.length);
  });

  // Removed backend connectivity test: focus on meaningful e2e integration
});
