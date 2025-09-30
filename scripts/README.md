# TypeScript Cache Clearing Utilities

This directory contains scripts to help clear TypeScript cache files, which can resolve various compilation and type checking issues.

## When to Use These Scripts

Consider clearing your TypeScript cache when you encounter:

1. Inconsistent TypeScript errors that don't match your code
2. TypeScript not recognizing changes to type definitions
3. Outdated type information persisting despite code changes
4. Strange "File not found" errors that contradict your project structure
5. TypeScript server repeatedly crashing or hanging
6. VS Code IntelliSense behaving inconsistently

## Usage

### From npm Scripts

Run any of the following npm scripts from the project root:

```bash
# Clear all TypeScript caches (recommended)
npm run clear-ts-cache

# Windows-specific cache clearing
npm run clear-ts-cache:win

# Linux/macOS-specific cache clearing
npm run clear-ts-cache:unix
```

### Direct Script Usage

#### Windows (PowerShell)

```powershell
# Clear all caches
./scripts/clear-ts-cache.ps1 -All

# Clear specific cache types
./scripts/clear-ts-cache.ps1 -NodeModules -VSCode
./scripts/clear-ts-cache.ps1 -TSServer
```

#### Linux/macOS (Bash)

```bash
# Clear all caches
./scripts/clear-ts-cache.sh --all

# Clear specific cache types
./scripts/clear-ts-cache.sh --node-modules --vscode
./scripts/clear-ts-cache.sh --tsserver
```

## What Gets Cleared

These scripts clear TypeScript caches from several locations:

1. **Node Modules Cache**: `.cache` directories in node_modules folders and `.tsbuildinfo` files
2. **VS Code Cache**: TypeScript-related caches in VS Code's storage folders
3. **TypeScript Server Cache**: TypeScript language service caches used by editors and IDEs

## After Clearing Cache

After clearing the TypeScript cache:

1. Restart VS Code or your IDE
2. Restart any running TypeScript compilers or watchers
3. Restart your development server if needed (`npm run dev`)

## Troubleshooting

If you continue to experience TypeScript issues after clearing the cache:

1. Check for TypeScript version mismatches between packages
2. Verify your tsconfig.json settings
3. Try removing node_modules and reinstalling dependencies
4. Check for conflicting type definitions
5. Run TypeScript in verbose mode to get more diagnostic information:

   ```bash
   npx tsc --traceResolution
   ```
