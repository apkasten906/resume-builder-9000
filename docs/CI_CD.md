# CI/CD Pipeline for Resume Builder 9000

This document describes the continuous integration and continuous deployment pipeline for the Resume Builder 9000 project.

## Overview

The CI/CD pipeline is implemented using GitHub Actions and consists of the following workflows:

1. **CI**: Runs on every push and pull request to the `main` and `dev` branches
2. **Pull Request**: Additional checks for pull requests
3. **Deploy**: Runs when code is merged to the `main` branch

## Workflows

### CI Workflow

Triggered on pushes and pull requests to `main` and `dev` branches.

- **Lint**: Checks code formatting and quality using ESLint
- **Test**: Runs all unit and integration tests
- **Build**: Ensures the project can be successfully built

### Pull Request Workflow

Triggered on pull request creation, updates, or reopening.

- **Validate PR**:
  - Runs linting
  - Runs tests
  - Builds packages
  - Checks for console.log statements
  - Checks for TODO comments without issue references

### Deploy Workflow

Triggered on pushes to the `main` branch.

- **Test**: Runs all tests again to ensure nothing was missed
- **Build**: Creates production-ready builds
- **Deploy**: (Commented out until deployment targets are specified)

## Configuration

### Branch Protection

Branch protection rules are enforced for the `main` and `dev` branches:

- Require passing CI checks before merging
- Require code reviews
- Require conversation resolution
- Prevent direct pushes

See [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) for detailed branch protection settings.

### Code Owners

The [CODEOWNERS](./CODEOWNERS) file specifies who is responsible for reviewing changes to different parts of the codebase.

## Development Process

1. Create feature branches from `dev`
2. Make changes and push to your feature branch
3. Create a pull request targeting the `dev` branch
4. Ensure CI checks pass and get code reviews
5. Merge to `dev` after approval
6. Periodically, create a release PR from `dev` to `main`
7. When merged to `main`, the deploy workflow will run automatically

## Badge

[![CI](https://github.com/apkasten906/resume-builder-9000/actions/workflows/ci.yml/badge.svg)](https://github.com/apkasten906/resume-builder-9000/actions/workflows/ci.yml)

## Troubleshooting

If CI checks fail:

1. Check the GitHub Actions logs for detailed error information
2. Run tests and linting locally before pushing
3. Ensure all dependencies are properly installed
4. Check for environment-specific issues
