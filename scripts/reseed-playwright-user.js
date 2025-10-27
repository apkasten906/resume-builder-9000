(async () => {
  const base = process.env.RESEED_BASE || 'http://localhost:4000';
  const secret = process.env.TEST_ROUTE_SECRET || 'development-test-secret-123';
  const email = process.env.RESEED_EMAIL || 'authtest2@example.com';
  const password = process.env.RESEED_PASSWORD || 'ValidPassword1!';
  const isDocker = process.env.DOCKER_TESTING === 'true';

  try {
    console.log('Deleting existing user (if any)');
    await fetch(`${base}/__test/delete-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-secret': secret },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    if (isDocker) {
      console.log('Seeding verified user inside Docker via test-support endpoint');
      const seedRes = await fetch(`${base}/__test/seed-verified-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-secret': secret },
        body: JSON.stringify({ email, password, name: 'Playwright Seed' }),
      });
      if (!seedRes.ok) {
        console.error(
          'Failed to seed verified user in container',
          seedRes.status,
          await seedRes.text()
        );
        process.exit(1);
      }
      console.log('Seeded verified user via API');
    } else {
      console.log('Clearing outbox');
      await fetch(`${base}/__test/clear-emails`, {
        method: 'POST',
        headers: { 'x-test-secret': secret },
      }).catch(() => {});

      console.log('Registering', email);
      const reg = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          confirmPassword: password,
          fullName: 'Playwright Seed',
        }),
      });
      const regText = await reg.text();
      console.log('  register status', reg.status, regText);

      // give the server a moment to write to outbox
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Reading outbox...');
      const emailsRes = await fetch(`${base}/__test/emails`, {
        headers: { 'x-test-secret': secret },
      });
      if (!emailsRes.ok) {
        console.error('Failed to read outbox', await emailsRes.text());
        process.exit(1);
      }
      const out = await emailsRes.json();
      const found = (out || []).reverse().find(e => e.to === email);
      if (!found) {
        console.error('No matching outbox entry for', email);
        console.error('Outbox length:', (out || []).length);
        process.exit(1);
      }
      console.log('Outbox entry found');
      const token =
        found.metadata?.token || (found.text && (found.text.match(/token=([a-f0-9-]+)/) || [])[1]);
      if (!token) {
        console.error('Could not extract token from outbox entry:', found);
        process.exit(1);
      }

      console.log('Verifying with token', token);
      const verifyRes = await fetch(`${base}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      console.log('  verify status', verifyRes.status, await verifyRes.text());
    }

    console.log('Attempting login with known password...');
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginText = await loginRes.text();
    console.log('  login status', loginRes.status, loginText);

    if (!loginRes.ok) process.exit(1);
    console.log('Re-seed+verify+login succeeded');
    process.exit(0);
  } catch (err) {
    console.error('Error in reseed script', err);
    process.exit(2);
  }
})();
