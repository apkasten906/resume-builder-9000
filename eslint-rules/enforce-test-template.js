/* eslint-disable */
// enforce-test-template.js
/**
 * ESLint rule: enforce-test-template
 * Ensures all test files conform to the standardized test template
 * - Requires imports of testLogger, dbCleanup, and test-setup
 * - Prohibits console.log usage
 * - Enforces presence of beforeAll, afterAll, beforeEach, afterEach
 * - Enforces Arrange/Act/Assert comments in test cases
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standardized test template usage',
      category: 'Best Practices',
    },
    messages: {
      missingImport: 'Test file must import {{name}} from the template.',
      noConsole: 'Use testLogger instead of console.log in tests.',
      missingHook: 'Test file must include {{hook}} block.',
      missingComment: 'Test case should include an {{section}} comment (Arrange/Act/Assert).',
    },
    schema: [],
  },
  create(context) {
    const requiredImports = [
      { name: 'testLogger', source: /@rb9k\/core\/testLogger/ },
      { name: 'dbCleanup', source: /\.\/db-cleanup\.template/ },
      { name: 'test', source: /\.\/test-setup/ },
    ];
    let hasImports = {
      testLogger: false,
      dbCleanup: false,
      test: false,
    };
    let hasHooks = {
      beforeAll: false,
      afterAll: false,
      beforeEach: false,
      afterEach: false,
    };

    return {
      ImportDeclaration(node) {
        requiredImports.forEach(({ name, source }) => {
          if (node.source.value && source.test(node.source.value)) {
            node.specifiers.forEach(spec => {
              if (spec.local.name === name) {
                hasImports[name] = true;
              }
            });
          }
        });
      },
      CallExpression(node) {
        // Prohibit console.log
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          node.callee.property.name === 'log'
        ) {
          context.report({ node, messageId: 'noConsole' });
        }
        // Detect hooks
        if (node.callee.name && Object.prototype.hasOwnProperty.call(hasHooks, node.callee.name)) {
          hasHooks[node.callee.name] = true;
        }
        // Enforce Arrange/Act/Assert comments in test cases
        if (node.callee.name === 'it' && node.arguments.length > 1) {
          const fn = node.arguments[1];
          if (fn.body && fn.body.body) {
            const sections = ['Arrange', 'Act', 'Assert'];
            for (const section of sections) {
              let hasComment = false;
              for (const stmt of fn.body.body) {
                if (stmt.leadingComments) {
                  for (const c of stmt.leadingComments) {
                    if (c.value.trim().toLowerCase().includes(section.toLowerCase())) {
                      hasComment = true;
                      break;
                    }
                  }
                }
                if (hasComment) break;
              }
              if (!hasComment) {
                context.report({ node: fn, messageId: 'missingComment', data: { section } });
              }
            }
          }
        }
      },
      'Program:exit'(node) {
        Object.entries(hasImports).forEach(([name, present]) => {
          if (!present) {
            context.report({ node, messageId: 'missingImport', data: { name } });
          }
        });
        Object.entries(hasHooks).forEach(([hook, present]) => {
          if (!present) {
            context.report({ node, messageId: 'missingHook', data: { hook } });
          }
        });
      },
    };
  },
};
