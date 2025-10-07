// Custom ESLint rule: no-hardcoded-test-data
/* eslint-disable */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded test/mock data in production code',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          suspiciousNames: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreTestFiles: {
            type: 'boolean',
          },
          testFilePattern: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const suspiciousNames = options.suspiciousNames || [
      'skills',
      'requirements',
      'mock',
      'testData',
      'parsedRequirements',
      'parsedSkills',
    ];
    const ignoreTestFiles = options.ignoreTestFiles !== false;
    const testFilePattern = options.testFilePattern || /\.test\.|\.spec\./;

    // Skip test files if configured
    if (ignoreTestFiles && testFilePattern.test(context.getFilename())) {
      return {};
    }

    function isSuspicious(node, type) {
      if (
        node.type === 'VariableDeclarator' &&
        node.init &&
        node.init.type === type &&
        ((type === 'ArrayExpression' && node.init.elements.length > 0) ||
          (type === 'ObjectExpression' && node.init.properties.length > 0))
      ) {
        const name = node.id.name || (node.id.type === 'ArrayPattern' && node.id.elements[0]?.name);
        if (name && suspiciousNames.some(s => name.toLowerCase().includes(s))) {
          return name;
        }
      }
      return false;
    }

    return {
      VariableDeclarator(node) {
        const arrayName = isSuspicious(node, 'ArrayExpression');
        const objectName = isSuspicious(node, 'ObjectExpression');
        if (arrayName) {
          context.report({
            node,
            message: `Hardcoded test/mock array '${arrayName}' detected. Use environment flags or test-only mocks.`,
          });
        }
        if (objectName) {
          context.report({
            node,
            message: `Hardcoded test/mock object '${objectName}' detected. Use environment flags or test-only mocks.`,
          });
        }
      },
    };
  },
};
