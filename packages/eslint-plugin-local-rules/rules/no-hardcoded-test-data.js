// Custom ESLint rule: no-hardcoded-test-data
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded test/mock data in production code',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    // Patterns to flag: arrays of skills, requirements, mock responses, etc.
    const suspiciousNames = [
      'skills',
      'requirements',
      'mock',
      'testData',
      'parsedRequirements',
      'parsedSkills',
    ];

    function isSuspiciousArray(node) {
      if (
        node.type === 'VariableDeclarator' &&
        node.init &&
        node.init.type === 'ArrayExpression' &&
        node.init.elements.length > 0
      ) {
        const name = node.id.name || (node.id.type === 'ArrayPattern' && node.id.elements[0]?.name);
        if (name && suspiciousNames.some(s => name.toLowerCase().includes(s))) {
          return true;
        }
      }
      return false;
    }

    return {
      VariableDeclarator(node) {
        if (isSuspiciousArray(node)) {
          context.report({
            node,
            message: 'Hardcoded test/mock data detected. Use environment flags or test-only mocks.',
          });
        }
      },
    };
  },
};
