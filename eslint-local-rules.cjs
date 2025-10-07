/* eslint-disable */
// Exports all custom ESLint rules for eslint-plugin-local-rules (CommonJS)
module.exports = {
  'no-hardcoded-test-data': require('./packages/eslint-plugin-local-rules/rules/no-hardcoded-test-data.js'),
  'require-test-logger': require('./packages/eslint-plugin-local-rules/rules/require-test-logger.js'),
  'require-explicit-test-types': require('./packages/eslint-plugin-local-rules/rules/require-explicit-test-types.js'),
};
