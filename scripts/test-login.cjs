// scripts/test-login.cjs
/* eslint-disable */
/* global console, require, __dirname, process */
const fs = require('fs');
const path = require('path');

// Test authService login function directly
async function testAuthServiceLogin() {
  try {
    // Set the DB_PATH environment variable to point to the correct location
    const dbPath = path.join(__dirname, '..', 'packages', 'api', 'resume.db');
    process.env.DB_PATH = dbPath;

    console.log(`Setting DB_PATH to: ${dbPath}`);
    console.log(`Does database file exist? ${fs.existsSync(dbPath) ? 'Yes' : 'No'}`);

    // Path to the compiled authService.js file
    const authServicePath = path.join(
      __dirname,
      '..',
      'packages',
      'api',
      'dist',
      'services',
      'authService.js'
    );

    if (!fs.existsSync(authServicePath)) {
      console.error(`Auth service file not found at ${authServicePath}`);
      return;
    }

    console.log(`Looking for auth service at ${authServicePath}`);

    // Try to require the module
    try {
      const authModule = require(authServicePath);
      console.log('Module imported successfully. Available exports:', Object.keys(authModule));

      if (authModule.authService) {
        console.log('Auth service found in module, testing login...');

        // Test with correct credentials
        const validResult = await authModule.authService.login(
          'user@example.com',
          'ValidPassword1!'
        );
        console.log('Login result with valid credentials:', validResult);

        // Test with incorrect password
        const invalidResult = await authModule.authService.login(
          'user@example.com',
          'WrongPassword'
        );
        console.log('Login result with invalid credentials:', invalidResult);
      } else {
        console.error('authService export not found in the module!');
      }
    } catch (requireError) {
      console.error('Error requiring the module:', requireError);
    }
  } catch (error) {
    console.error('Error testing auth service:', error);
  }
}

// Run the test
testAuthServiceLogin();
