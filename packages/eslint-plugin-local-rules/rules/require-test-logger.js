// Custom ESLint rule: require-test-logger
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce testLogger usage in test files instead of console.log',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isTestFile = /\.(test|spec)\.(ts|js)$/.test(filename);

    if (!isTestFile) {
      return {};
    }

    let hasTestLoggerImport = false;

    return {
      ImportDeclaration(node) {
        // Check for testLogger import
        if (node.source.value && node.source.value.includes('testLogger')) {
          hasTestLoggerImport = true;
        }
      },

      CallExpression(node) {
        // Check for console.log usage
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          node.callee.property.name === 'log'
        ) {
          context.report({
            node,
            message: 'Use testLogger instead of console.log in test files',
            fix(fixer) {
              return fixer.replaceText(node.callee, 'testLogger.info');
            },
          });
        }
      },

      'Program:exit'() {
        // If console.log was found but no testLogger import, suggest adding it
        if (!hasTestLoggerImport) {
          const hasConsoleLog = context.getSourceCode().getText().includes('console.log');
          if (hasConsoleLog) {
            context.report({
              node: context.getSourceCode().ast,
              message: 'Test files should import testLogger for structured logging',
            });
          }
        }
      },
    };
  },
};
