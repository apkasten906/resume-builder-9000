// .eslintrc.cjs (root)
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: [
    '@typescript-eslint',
    '@next/next',
    // Use 'local-rules' for plugin name, not 'eslint-plugin-local-rules'
    'local-rules',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@next/next/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'local-rules/no-hardcoded-test-data': 'error', // Updated to use new plugin
  },
  overrides: [
    // Node and tool config files (relax TypeScript rules and disable custom rules for plain JS config files)
    {
      files: [
        'next.config.js',
        '*.config.js',
        '*.config.cjs',
        '*.config.mjs',
        'tailwind.config.js',
        'tailwind.config.cjs',
      ],
      env: { node: true },
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'local-rules/no-hardcoded-test-data': 'off',
      },
    },
    // Backend API (Node)
    {
      files: ['packages/api/**/*.{js,ts}'],
      env: { node: true, browser: false },
      rules: {
        '@next/next/no-html-link-for-pages': 'off',
        '@next/next/no-img-element': 'off',
      },
    },
    // Core library (Node)
    {
      files: ['packages/core/**/*.{js,ts}'],
      env: { node: true, browser: false },
    },
    // Exclude custom rule from all test folders (must be last for precedence)
    {
      files: ['apps/web/tests/**/*', 'packages/core/tests/**/*', 'packages/api/tests/**/*'],
      rules: {
        'local-rules/no-hardcoded-test-data': 'off', // Removed legacy rule
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        paths: ['.'],
      },
    },
  },
};

// Note: 'plugin:@next/next/recommended' includes rules from 'eslint-config-next'
// which is the official ESLint configuration for Next.js projects.
// This setup ensures that ESLint is properly configured for a Next.js project
// while also integrating Prettier for code formatting.
