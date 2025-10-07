#!/usr/bin/env node
// Simple cross-platform script to run the appropriate TypeScript cache clearing script

// Use cross-platform spawn
import { spawnSync } from 'child_process';

// Check if we're on Windows
const isWindows = process.platform === 'win32';

// Spawn the appropriate script
const scriptResult = isWindows
  ? spawnSync('npm', ['run', 'clear-ts-cache:win'], { stdio: 'inherit', shell: true })
  : spawnSync('npm', ['run', 'clear-ts-cache:unix'], { stdio: 'inherit', shell: true });

// Exit with the same code as the script
process.exit(scriptResult.status || 0);
