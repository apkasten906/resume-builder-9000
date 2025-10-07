// Custom ESLint rule: require-explicit-test-types
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce explicit typing in test files for better maintainability',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isTestFile = /\.(test|spec)\.ts$/.test(filename);

    if (!isTestFile) {
      return {};
    }

    return {
      VariableDeclarator(node) {
        // Check for variables without explicit types (excluding const with literal values)
        if (
          node.id.type === 'Identifier' &&
          !node.id.typeAnnotation &&
          node.init &&
          // Allow const with literal values (strings, numbers, booleans)
          !(
            node.parent.kind === 'const' &&
            (node.init.type === 'Literal' ||
              node.init.type === 'TemplateLiteral' ||
              (node.init.type === 'UnaryExpression' &&
                node.init.operator === '!' &&
                node.init.argument.type === 'Literal'))
          ) &&
          // Focus on test-related variables
          (node.id.name.includes('mock') ||
            node.id.name.includes('test') ||
            node.id.name.includes('expected') ||
            node.id.name.includes('actual') ||
            node.id.name.includes('result') ||
            node.id.name.includes('response') ||
            node.id.name.includes('data') ||
            node.id.name.includes('config'))
        ) {
          context.report({
            node: node.id,
            message: `Variable '${node.id.name}' should have an explicit type annotation in test files`,
          });
        }
      },

      FunctionDeclaration(node) {
        // Check for test helper functions without return type annotations
        if (
          node.id &&
          !node.returnType &&
          (node.id.name.startsWith('test') ||
            node.id.name.startsWith('mock') ||
            node.id.name.startsWith('create') ||
            node.id.name.startsWith('setup') ||
            node.id.name.startsWith('make'))
        ) {
          context.report({
            node: node.id,
            message: `Test helper function '${node.id.name}' should have an explicit return type annotation`,
          });
        }
      },
    };
  },
};
