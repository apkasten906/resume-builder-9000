// Entrypoint for eslint-plugin-local-rules
module.exports = {
  rules: {
    'no-hardcoded-test-data': require('./rules/no-hardcoded-test-data'),
  },
};
