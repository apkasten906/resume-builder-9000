# Enhanced Development Script Guide

**Note: As of September 29, 2025, the enhanced features documented here have been integrated into the main `dev.ps1` script. This document is kept for reference purposes.**

The enhanced development script was created to improve error detection and handling for the Resume Builder 9000 application, with additional safeguards and monitoring capabilities that are now part of the standard development workflow.

## New Features

### 1. Critical Vulnerability Detection

- Automatically scans dependencies for critical security vulnerabilities during installation
- Prompts the user to confirm if they want to continue despite detected vulnerabilities
- Logs vulnerability information for future reference

### 2. SWC Binary Compatibility Handling

- Detects when Next.js SWC binary fails to load during installation
- Automatically configures Next.js to fall back to Babel for transpilation
- Sets necessary environment variables and updates `next.config.js` to disable SWC features

### 3. Service Health Monitoring

- Checks if API and web frontend services successfully start and respond to requests
- Implements retry logic with configurable timeout to allow for slower startup
- Reports detailed health status of each service

### 4. Automatic Process Management

- Kills any stale development servers before starting new ones
- Tracks running processes to detect unexpected crashes
- Gracefully stops all processes when errors occur or when terminating the script

### 5. Enhanced Error Handling

- Provides detailed error messages with stack traces
- Logs errors to a file (`dev-error.log`) for later diagnosis
- Returns proper exit codes to indicate success or failure

## Usage

Run the development script with the standard parameters:

```powershell
./dev.ps1 [-Fresh] [-WithLLM] [-LLMProvider <provider>] [-LLMModel <model>] [-ApiOnly] [-WebOnly] [-Help]
```

All enhanced features are now included in the main dev.ps1 script.

## Additional Options

- `-Fresh`: Removes all node_modules folders for a clean installation
- `-WithLLM`: Enables external LLM integration
- `-ApiOnly`: Runs only the API server
- `-WebOnly`: Runs only the web frontend
- `-Help`: Displays help information

## Error Logs

If any errors occur during execution, they will be logged to `dev-error.log` in the root directory.

## Implementation Status

✅ **Completed**: All features have been integrated into the main `dev.ps1` script.

## Future Improvements

1. Add memory usage monitoring for running processes
2. Implement performance metrics collection
3. Consider adding telemetry for development environment errors
4. Add automatic recovery for failed services
