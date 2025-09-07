module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["node_modules", "dist", ".next", "coverage"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: [
      "./tsconfig.json",
      "./packages/*/tsconfig.json",
      "./apps/*/tsconfig.json",
    ],
  },
  rules: {
    // Error prevention
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "no-debugger": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      { allowExpressions: true },
    ],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

    // Code quality
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error",

    // Style
    semi: ["error", "always"],
    quotes: ["error", "single", { avoidEscape: true }],
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/*.spec.tsx"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
