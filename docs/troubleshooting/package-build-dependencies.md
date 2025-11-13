# Package Build Dependencies

## Issue

When running Playwright tests, you may encounter this error:

```
Error: Cannot find package 'node_modules@rb9k\core\dist\index.js' imported from C:\Development\rb9k-docker\resume-builder-9000\apps\web\tests\e2e\utils\test-logger.ts
```

## Root Cause

The `@rb9k/core` package needs to be built (TypeScript compiled to JavaScript) before other packages can import it. This is a common issue in TypeScript monorepos where packages depend on each other.

## Solutions

### 1. Quick Fix - Build Core Package

```powershell
cd packages\core
npm run build
```

### 2. Build All Packages in Dependency Order

```powershell
# From repository root
.\scripts\build-packages.ps1

# Or use workspace build command
npm run build --workspaces
```

### 3. Automatic Build in Playwright

The Playwright global setup now automatically builds all required packages before running tests. You can skip this by setting:

```bash
PLAYWRIGHT_SKIP_BUILD=1
```

## Package Dependencies

Our monorepo has the following build dependencies:

```
@rb9k/core (foundation)
├── packages/api (depends on core)
└── apps/web (depends on core)
```

### Build Order

1. **packages/core** - Must be built first
2. **packages/api** - Can be built after core
3. **apps/web** - Can be built after core

## Prevention

### During Development

- Run `.\dev.ps1` which includes build steps
- Or run `npm run build --workspaces` after any core package changes

### During CI/CD

- Ensure build step runs before tests:
  ```bash
  npm run build --workspaces
  npm run test:e2e
  ```

### In Docker

- The Dockerfile already handles this with multi-stage builds
- Core is built in the `core-builder` stage
- Other packages reference the built core

## VS Code Integration

When running tests in VS Code Test Explorer:

1. The Playwright global setup will automatically build packages
2. If you see build errors, manually run: `.\scripts\build-packages.ps1`
3. Refresh the Test Explorer

## Troubleshooting

### Check if packages are built:

```powershell
# Check core package
ls packages\core\dist

# Check if index.js exists
Test-Path packages\core\dist\index.js
```

### Clean and rebuild:

```powershell
# Clean all build artifacts
npm run clean

# Rebuild everything
.\scripts\build-packages.ps1
```

### Common TypeScript Issues:

- **Import errors**: Usually means core package isn't built
- **Type errors**: Run `npm run build` in the core package
- **Module not found**: Ensure dependencies are installed (`npm install`)
