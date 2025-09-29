import { test } from './test-setup';
import { randomUUID } from 'crypto';

// Import constants for URLs
const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

/**
 * Test that focuses on the API communication without UI interactions
 * This helps isolate whether the issue is with API endpoints or UI integration
 */
test('API endpoints for applications', async ({ page, request }) => {
  console.log('Starting API endpoints test');

  // First navigate to any page to establish session context
  await page.goto(`${WEB_BASE}`);
  await page.waitForLoadState('networkidle');

  // Capture authentication state
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  console.log('Session cookie present:', sessionCookie ? 'Yes' : 'No');

  // Headers for API requests
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth header if we have a session cookie
  if (sessionCookie) {
    headers['Cookie'] = `session=${sessionCookie.value}`;
  }

  // Test GET /applications endpoint
  console.log('Testing GET /applications endpoint...');
  const getResponse = await request.get(`${API_BASE}/applications`, { headers });

  console.log(`GET /applications status: ${getResponse.status()}`);
  if (getResponse.ok()) {
    const data = await getResponse.json();
    console.log('Applications returned:', data.items?.length || 0);
    console.log('First few applications:', data.items?.slice(0, 2));
  } else {
    const errorText = await getResponse.text();
    console.log('GET error response:', errorText);
  }

  // Test POST /applications endpoint
  console.log('Testing POST /applications endpoint...');
  const testApp = {
    company: `API Test Co ${randomUUID().slice(0, 8)}`,
    role: 'API Test Role',
  };

  const postResponse = await request.post(`${API_BASE}/applications`, {
    headers,
    data: testApp,
  });

  console.log(`POST /applications status: ${postResponse.status()}`);
  if (postResponse.ok()) {
    const data = await postResponse.json();
    console.log('Created application:', data);
  } else {
    const errorText = await postResponse.text();
    console.log('POST error response:', errorText);
  }

  // Try GET again to see if the new application appears
  if (postResponse.ok()) {
    console.log('Verifying application was created...');
    const verifyResponse = await request.get(`${API_BASE}/applications`, { headers });

    if (verifyResponse.ok()) {
      const data = await verifyResponse.json();
      const found = data.items?.find((app: { company: string }) => app.company === testApp.company);
      console.log('Application found in GET response:', found ? 'Yes' : 'No');
    }
  }

  // Alternative: Try using fetch via page.evaluate to see if that works better
  // This uses the same authentication context as the page
  console.log('Testing API call through page.evaluate()...');

  const testCompany = `Browser Test Co ${randomUUID().slice(0, 8)}`;
  const pageApiResult = await page.evaluate(
    async ({ apiBase, company }: { apiBase: string; company: string }) => {
      try {
        // GET request via browser
        const getResp = await fetch(`${apiBase}/applications`);
        const getData = await getResp.json();

        // POST request via browser
        const postResp = await fetch(`${apiBase}/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: company,
            role: 'Browser Test Role',
          }),
        });

        return {
          getStatus: getResp.status,
          getItems: getData.items?.length || 0,
          postStatus: postResp.status,
          postOk: postResp.ok,
        };
      } catch (error) {
        return { error: String(error) };
      }
    },
    { apiBase: API_BASE, company: testCompany }
  );

  console.log('Browser API test results:', pageApiResult);

  console.log('API endpoints test completed');
});
