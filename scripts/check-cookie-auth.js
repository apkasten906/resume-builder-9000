(async () => {
  const base = 'http://localhost:4000';
  try {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'authtest2@example.com', password: 'ValidPassword1!' }),
    });
    const loginBody = await loginRes.json();
    console.log('login status', loginRes.status);
    if (!loginRes.ok) {
      console.log('login body', loginBody);
      process.exit(1);
    }
    const token = loginBody.token;
    console.log('token length', token?.length);
    const meRes = await fetch(`${base}/auth/me`, {
      headers: { Cookie: `session=${token}` },
    });
    const meBody = await meRes.text();
    console.log('me status', meRes.status, meBody);
  } catch (err) {
    console.error('error', err);
    process.exit(2);
  }
})();
