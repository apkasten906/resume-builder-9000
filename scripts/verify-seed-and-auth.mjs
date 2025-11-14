#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

function readEnv(root) {
  const p = path.join(root, '.env');
  if (!fs.existsSync(p)) return {};
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  const env = {};
  for (const l of lines) {
    const m = l.match(/^\s*([A-Z0-9_]+)=(.*)$/i);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const root = process.cwd();
  const env = readEnv(root);
  const apiBase = env.API_BASE || 'http://localhost:4002';
  const secret = env.TEST_ROUTE_SECRET || '';

  console.log('Using API_BASE=', apiBase);
  console.log('Using TEST_ROUTE_SECRET=', secret ? '[present]' : '[missing]');

  // Seed verified user
  const seedUrl = `${apiBase.replace(/\/$/, '')}/__test/seed-verified-user`;
  console.log('Seeding verified user via', seedUrl);
  const seedResp = await fetch(seedUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-test-secret': secret,
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'ValidPassword1!',
      name: 'Test User',
    }),
  });
  console.log('Seed status', seedResp.status);
  console.log(await seedResp.text());

  // Login to receive session cookie
  const loginUrl = `${apiBase.replace(/\/$/, '')}/auth/login`;
  console.log('Logging in via', loginUrl);
  const loginResp = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com', password: 'ValidPassword1!' }),
    redirect: 'manual',
  });
  console.log('Login status', loginResp.status);
  const setCookie = loginResp.headers.get('set-cookie') || loginResp.headers.get('Set-Cookie');
  console.log('Set-Cookie header:', setCookie);
  const body = await loginResp.text();
  console.log('Login body:', body);

  if (!setCookie) {
    console.error('No session cookie returned; cannot proceed to authenticated request');
    process.exit(5);
  }
  // Use cookie to call protected endpoint - ensure we only send the cookie pair (name=value)
  const cookiePair = setCookie.split(';')[0];
  // Use only the first cookie (session)
  // Check /auth/me to verify the session is accepted by the auth middleware
  const meUrl = `${apiBase.replace(/\/$/, '')}/auth/me`;
  console.log('Requesting auth/me with Cookie:', cookiePair);
  const meResp = await fetch(meUrl, { headers: { Cookie: cookiePair } });
  console.log('/auth/me status', meResp.status);
  console.log('/auth/me body', await meResp.text());

  // Note: applications routes are mounted at '/' + 'applications' (not under /api)
  const appsUrl = `${apiBase.replace(/\/$/, '')}/applications`;
  console.log('Requesting protected endpoint', appsUrl, 'with Cookie:', cookiePair);
  const appsResp = await fetch(appsUrl, { headers: { Cookie: cookiePair } });
  console.log('applications status', appsResp.status);
  const appsBody = await appsResp.text();
  console.log('applications body:', appsBody);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(10);
});
