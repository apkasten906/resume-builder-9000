# Package Dependency Fixes for PR #13 Review

This document outlines the dependency fixes needed to address the Copilot review comments on PR #13.

## Issues to Address

### 1. Playwright Packages in Wrong Section
**Issue**: Playwright packages are in `dependencies` but should be in `devDependencies`
**Files**: `apps/web/package.json`
**Action**: Move these packages to devDependencies:
- `@playwright/test`
- `playwright`

### 2. React in Wrong Section
**Issue**: React is in `devDependencies` but should be in `dependencies` for production
**Files**: `apps/web/package.json`
**Action**: Move `react` and `react-dom` to dependencies section

### 3. Express Version Conflicts
**Issue**: Root package.json has Express 4.x while packages/api has Express 5.x
**Files**: `package.json`, `packages/api/package.json`
**Action**: Standardize on Express version (likely 5.x) or remove from root if not needed

## Implementation Notes

Since we're working from main branch and the actual changes are in the dev branch (PR #13), these fixes would need to be applied to the appropriate package.json files when the PR is updated.

The current main branch doesn't show these specific issues, indicating they were introduced in the dev branch changes.

## Commands to Apply (when working with actual PR)

```bash
# For apps/web/package.json:
# Move Playwright to devDependencies
# Move React to dependencies

# For root package.json:
# Align Express versions or remove conflicting dependencies
```