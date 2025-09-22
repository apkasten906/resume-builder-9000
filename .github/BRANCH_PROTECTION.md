# Branch Protection Rules

This document outlines the branch protection rules that should be configured in the GitHub repository settings.

## Protected Branches

### `main` branch

- [x] Require pull request reviews before merging
  - [x] Required approving reviews: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners

- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - Required status checks:
    - [x] lint (Lint)
    - [x] test (Test)
    - [x] build (Build)

- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings

### `dev` branch

- [x] Require pull request reviews before merging
  - [x] Required approving reviews: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed

- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - Required status checks:
    - [x] lint (Lint)
    - [x] test (Test)
    - [x] build (Build)

- [x] Require conversation resolution before merging

## Setup Instructions

1. Go to the GitHub repository settings
2. Navigate to "Branches" section
3. Under "Branch protection rules", click "Add rule"
4. Configure the rules as described above for each branch
5. Save changes

## Workflow

1. All development work should be done in feature branches
2. Feature branches should be created from the `dev` branch
3. Pull requests should target the `dev` branch
4. Once features are tested and stable in `dev`, a release PR can be created from `dev` to `main`
5. Merging to `main` triggers the deployment workflow

## Important Notes

- CI checks must pass before any PR can be merged
- Code reviews are required for all PRs
- All conversations must be resolved before merging
- Pushing directly to `main` and `dev` is not allowed
