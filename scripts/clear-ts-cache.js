#!/usr/bin/env node
/**
 * TypeScript Cache Clearing Script
 *
 * This script serves as a cross-platform wrapper around the platform-specific
 * cache clearing scripts (PowerShell and Bash).
 *
 * Usage:
 *   node clear-ts-cache.js [--all] [--node-modules] [--vscode] [--tsserver]
 */

import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes('--all'),
  nodeModules: args.includes('--node-modules'),
  vscode: args.includes('--vscode'),
  tsserver: args.includes('--tsserver'),
  help: args.includes('--help'),
};

// Show help if requested or no options provided
if (
  options.help ||
  (!options.all && !options.nodeModules && !options.vscode && !options.tsserver)
) {
  // eslint-disable-next-line no-console
  console.log(`
TypeScript Cache Clearing Tool

USAGE:
    node clear-ts-cache.js [--all] [--node-modules] [--vscode] [--tsserver] [--help]

OPTIONS:
    --all           Clear all TypeScript caches
    --node-modules  Clear Node modules cache (node_modules/.cache)
    --vscode        Clear VS Code TypeScript cache
    --tsserver      Clear TypeScript server cache
    --help          Show this help message

EXAMPLES:
    node clear-ts-cache.js --all
    node clear-ts-cache.js --node-modules --vscode
  `);
  process.exit(0);
}

/**
 * Convert Node.js args to platform-specific args
 * @returns {Array} The converted arguments array
 */
function getScriptArgs() {
  const scriptArgs = [];

  if (options.all) {
    scriptArgs.push(isWindows() ? '-All' : '--all');
  } else {
    if (options.nodeModules) {
      scriptArgs.push(isWindows() ? '-NodeModules' : '--node-modules');
    }
    if (options.vscode) {
      scriptArgs.push(isWindows() ? '-VSCode' : '--vscode');
    }
    if (options.tsserver) {
      scriptArgs.push(isWindows() ? '-TSServer' : '--tsserver');
    }
  }

  return scriptArgs;
}

/**
 * Determine if running on Windows
 * @returns {boolean} True if running on Windows
 */
function isWindows() {
  return process.platform === 'win32';
}

/**
 * Get the appropriate script path based on platform
 * @returns {string} Path to the platform-specific script
 */
function getScriptPath() {
  if (isWindows()) {
    return path.join(__dirname, 'clear-ts-cache.ps1');
  } else {
    return path.join(__dirname, 'clear-ts-cache.sh');
  }
}

/**
 * Execute the platform-specific script
 */
function runPlatformScript() {
  const scriptPath = getScriptPath();
  const scriptArgs = getScriptArgs();

  // eslint-disable-next-line no-console
  console.log(`Running ${path.basename(scriptPath)} with options: ${scriptArgs.join(' ')}`);

  if (!fs.existsSync(scriptPath)) {
    // eslint-disable-next-line no-console
    console.error(`Error: Script not found at ${scriptPath}`);
    process.exit(1);
  }

  const result = isWindows()
    ? spawnSync(
        'powershell.exe',
        ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...scriptArgs],
        { stdio: 'inherit' }
      )
    : spawnSync('bash', [scriptPath, ...scriptArgs], { stdio: 'inherit' });

  if (result.status !== null) {
    process.exit(result.status);
  } else {
    process.exit(1); // Exit with error if status is null
  }
}

// Run the script
runPlatformScript();
