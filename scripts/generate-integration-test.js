// Script: generate-integration-test.js
// Usage: node scripts/generate-integration-test.js <spec.yaml> <output.ts>
// Reads a YAML spec and generates a valid integration test file

import fs from 'fs';
import yaml from 'js-yaml';

function renderTest(spec) {
  return `/* eslint-disable */\n// @ts-nocheck\n// Generated from YAML spec: ${spec.module}\nimport { test, expect } from './test-setup';\nimport { testLogger } from '@rb9k/core/testLogger';\nimport { ${spec.module} } from '../src/${spec.module.toLowerCase()}.js';\n${spec.dependencies.map(dep => `import { ${dep.name} } from '../src/${dep.name.toLowerCase()}.js';`).join('\n')}\n\ndescribe('${spec.module} Integration Tests', () => {\n  let integrationContext;\n  let realDependency;\n\n  beforeAll(async () => {\n    testLogger.info('Setting up integration test suite');\n    realDependency = await ${spec.dependencies[0].name}.initialize({});\n  });\n\n  afterAll(async () => {\n    testLogger.info('Tearing down integration test suite');\n    await realDependency?.cleanup();\n  });\n\n  beforeEach(async () => {\n    testLogger.info('Setting up integration test case');\n    integrationContext = {};\n    await realDependency.resetState();\n  });\n\n  afterEach(async () => {\n    testLogger.info('Cleaning up integration test case');\n    await integrationContext?.cleanup();\n  });\n\n  ${spec.tests.map(test => `it('${test.name}', async () => {\n    // Arrange\n    const input = ${JSON.stringify(test.input, null, 2)};\n    const expected = ${JSON.stringify(test.expected, null, 2)};\n    testLogger.debug('Testing with input:', input);\n    const moduleInstance = new ${spec.module}(realDependency);\n    const result = await moduleInstance.executeWorkflow(input);\n    testLogger.debug('Workflow completed with result:', result);\n    expect(result).toEqual(expected);\n  });`).join('\n\n  ')}\n});\n`;
}

function main() {
  const [, , yamlPath, outPath] = process.argv;
  if (!yamlPath || !outPath) {
    console.error('Usage: node scripts/generate-integration-test.js <spec.yaml> <output.ts>');
    process.exit(1);
  }
  const spec = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
  const testFile = renderTest(spec);
  fs.writeFileSync(outPath, testFile);
  console.log(`Generated test file: ${outPath}`);
}

main();
