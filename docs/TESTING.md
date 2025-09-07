# VS Code Testing Setup Guide for Resume Builder 9000

This guide will help you set up and use the VS Code testing interface for the Resume Builder 9000 project.

## Setup Instructions

1. **Install Required Extensions**
   - Vitest: `vitest.explorer` 
   - Test Explorer UI: `hbenl.vscode-test-explorer`

2. **Reload VS Code**
   - After installing the extensions, reload the VS Code window
   - Command Palette: `Developer: Reload Window`

3. **Open Testing View**
   - Click the beaker icon in the VS Code sidebar
   - Or use Command Palette: `View: Show Testing`

## Running Tests

### From VS Code Interface
- Click the play button next to any test to run it
- Click the play button at the top of the Testing view to run all tests

### From Terminal

```powershell
# Run all tests in a package
Set-Location -Path "C:\Development\resume-builder-9000\packages\core"
npm test

# Watch mode (automatically re-run on file changes)
npm run test:watch

# Visual test UI in browser
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Keyboard Shortcuts
- `Ctrl+Shift+P` → "Test: Run All Tests"
- `Ctrl+Shift+P` → "Test: Run Failed Tests"
- `Ctrl+Shift+P` → "Test: Debug Test at Cursor"

## Troubleshooting

If tests are not appearing in the Test Explorer:

1. **Check file naming**
   - Test files should follow the pattern: `*.test.ts` or `*.spec.ts`

2. **Manual refresh**
   - Command Palette: `Testing: Refresh Tests`

3. **Check Vitest config**
   - Verify that the test patterns in `vitest.config.ts` match your project structure

4. **Run tests from terminal**
   - If tests run successfully from the terminal but don't appear in the UI, try reloading VS Code

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [VS Code Testing Documentation](https://code.visualstudio.com/docs/editor/testing)
