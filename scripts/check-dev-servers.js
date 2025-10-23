#!/usr/bin/env node
/**
 * Pre-flight check for E2E tests
 * Verifies that both WEB and API dev servers are running before executing tests
 */

import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

/**
 * Check if a server is reachable
 * @param {string} url - The base URL to check
 * @param {string} name - Human-readable name for logging
 * @returns {Promise<boolean>}
 */
function checkServer(url, name) {
  return new Promise(resolve => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: '/',
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, res => {
      if (res.statusCode >= 200 && res.statusCode < 500) {
        console.log(`✓ ${name} is running at ${url} (Status: ${res.statusCode})`);
        resolve(true);
      } else {
        console.error(`✗ ${name} returned unexpected status: ${res.statusCode}`);
        resolve(false);
      }
      res.resume(); // Consume response data to free up memory
    });

    req.on('error', err => {
      console.error(`✗ ${name} is not reachable at ${url}`);
      console.error(`  Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error(`✗ ${name} request timed out at ${url}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('\n=== Dev Server Pre-flight Check ===\n');

  const webOk = await checkServer(WEB_BASE, 'Web Server');
  const apiOk = await checkServer(API_BASE, 'API Server');

  console.log('\n=== Check Complete ===\n');

  if (!webOk || !apiOk) {
    console.error('ERROR: One or more dev servers are not running.\n');
    console.error('Please start the dev environment using the "Run Dev Script" task in VS Code:');
    console.error('  1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)');
    console.error('  2. Select "Tasks: Run Task"');
    console.error('  3. Choose "Run Dev Script"');
    console.error('  4. Wait for both servers to start successfully\n');
    process.exit(1);
  }

  console.log('All dev servers are running. Proceeding with E2E tests...\n');
  process.exit(0);
}

main();
