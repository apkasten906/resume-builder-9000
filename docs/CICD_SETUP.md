# Resume Builder 9000 CI/CD Setup

This document provides instructions for setting up the CI/CD pipeline for the Resume Builder 9000 project.

## GitHub Actions Setup

The CI/CD pipeline is implemented using GitHub Actions. The workflow files are located in the `.github/workflows` directory.

### Workflow Files

- `ci.yml`: Runs linting, tests, and build on every push and pull request to the main and dev branches.
- `pull-request.yml`: Additional checks for pull requests.
- `deploy.yml`: Runs when code is merged to the main branch.

## Local Development Setup

### Git Hooks (Option 1: Manual)

Git hooks are provided to run checks before committing or pushing code. To install them, run:

```powershell
.\scripts\setup-hooks.ps1
```

The hooks will:

- Run linting and tests on staged files before committing
- Run all linting, tests, and build steps before pushing

### Git Hooks (Option 2: Husky)

Alternatively, you can use Husky for Git hooks management. To switch to Husky:

1. Rename `package.json.husky` to replace the current `package.json`:

   ```powershell
   Move-Item -Path .\package.json.husky -Destination .\package.json -Force
   ```

2. Install Husky:
   ```powershell
   npm install
   npm run prepare
   ```

## Branch Protection Rules

To enforce code quality, branch protection rules should be configured in GitHub:

1. Go to the repository settings
2. Navigate to "Branches"
3. Add protection rules for `main` and `dev` branches
4. Require pull request reviews and passing status checks

See [BRANCH_PROTECTION.md](../.github/BRANCH_PROTECTION.md) for detailed settings.

## Code Quality Tools

- **ESLint**: Lints TypeScript/JavaScript files
- **TypeScript**: Ensures type safety
- **Vitest**: Runs tests

## Continuous Integration

The CI workflow runs on every push and pull request to the `main` and `dev` branches:

1. Checks code quality using ESLint
2. Runs all tests
3. Builds the project

## Continuous Deployment

When code is merged to `main`, the deploy workflow:

1. Runs tests
2. Builds the project
3. (When configured) Deploys to production

## Setting Up Required Secrets

For the CI/CD pipeline to work properly, the following secrets should be configured in GitHub:

1. Go to your repository's "Settings" > "Secrets and variables" > "Actions"
2. Add the following secrets as needed:
   - `NODE_AUTH_TOKEN`: For private npm registry (if needed)

## Troubleshooting

If CI checks fail:

1. Check the GitHub Actions logs for detailed error information
2. Run tests and linting locally
3. Ensure all dependencies are properly installed
