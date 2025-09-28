// Test script to verify API connectivity

// We can use global fetch in Node.js

async function testApi() {
  try {
    // Test API health endpoint
    const healthResponse = await fetch('http://localhost:4000/health');
    process.stdout.write('Health endpoint status: ' + healthResponse.status + '\n');
    process.stdout.write('Health endpoint body: ' + (await healthResponse.text()) + '\n\n');

    // Test login endpoint
    process.stdout.write('Testing login endpoint...\n');
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'ValidPassword1!' }),
    });
    process.stdout.write('Login endpoint status: ' + loginResponse.status + '\n');
    const loginData = await loginResponse.json().catch(() => ({}));
    process.stdout.write('Login endpoint response: ' + JSON.stringify(loginData) + '\n\n');

    // Test frontend login page
    process.stdout.write('Testing frontend login page...\n');
    const frontendResponse = await fetch('http://localhost:3000/login');
    process.stdout.write('Frontend login page status: ' + frontendResponse.status + '\n');
    const frontendContent = await frontendResponse.text();
    process.stdout.write(
      'Frontend login page contains form: ' +
        (frontendContent.includes('form') ? 'Yes' : 'No') +
        '\n'
    );
  } catch (error) {
    process.stderr.write('Test failed: ' + error.message + '\n');
  }
}

testApi();
