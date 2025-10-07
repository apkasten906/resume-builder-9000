// enforce-test-template-fix.js
/* eslint-disable */
/**
 * Auto-fix script for test template enforcement
 * - Adds missing imports
 * - Replaces console.log with testLogger
 * - Adds missing hooks
 * - Inserts Arrange/Act/Assert comments in test cases
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixTestFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add missing imports
  if (!content.includes('testLogger')) {
    content = `import { testLogger } from '@rb9k/core/testLogger';\n` + content;
  }
  if (!content.includes('dbCleanup')) {
    content = `import { dbCleanup } from './db-cleanup.template';\n` + content;
  }
  if (!content.includes('test')) {
    content = `import { test } from './test-setup';\n` + content;
  }

  // Replace console.log with testLogger
  content = content.replace(/console\.log/g, 'testLogger.info');

  // Add missing hooks
  ['beforeAll', 'afterAll', 'beforeEach', 'afterEach'].forEach(hook => {
    if (!content.includes(`${hook}(`)) {
      content += `\n${hook}(async () => {\n  // TODO: Implement ${hook} logic\n});\n`;
    }
  });

  // Insert Arrange/Act/Assert comments in test cases
  content = content.replace(
    /it\(([^,]+),\s*async\s*\(.*?\)\s*=>\s*{([\s\S]*?)}/g,
    (match, testName, body) => {
      let fixedBody = body;
      if (!/Arrange/.test(body)) fixedBody = `// Arrange\n` + fixedBody;
      if (!/Act/.test(body)) fixedBody = fixedBody + `\n// Act`;
      if (!/Assert/.test(body)) fixedBody = fixedBody + `\n// Assert`;
      return `it(${testName}, async () => {${fixedBody}}`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

function fixAllTests(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fixAllTests(filePath);
    } else if (/\.test\.ts$|\.spec\.ts$/.test(file)) {
      fixTestFile(filePath);
      process.stdout.write(`Fixed: ${filePath}\n`);
    }
  });
}

// Usage: node enforce-test-template-fix.js <test-directory>
if (process.argv[1] === __filename) {
  const testDir = process.argv[2] || path.join(__dirname, '../apps');
  fixAllTests(testDir);
}
