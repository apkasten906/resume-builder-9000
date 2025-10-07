// Entrypoint for eslint-plugin-local-rules
module.exports = {
  rules: {
    'no-hardcoded-test-data': require('./rules/no-hardcoded-test-data'),
    'require-test-logger': require('./rules/require-test-logger'),
    'require-explicit-test-types': require('./rules/require-explicit-test-types'),
  },
};
