#!/usr/bin/env pwsh
param(
    [switch]$Verbose,
    [switch]$Headed,
    [switch]$Reporter,
    [string]$TestFile = "",
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host @"
Run Playwright E2E Tests

USAGE:
    ./run-playwright-tests.ps1 [-Verbose] [-Headless <bool>] [-Reporter] [-TestFile <path>] [-Help]

OPTIONS:
    -Verbose    Enable verbose logging for tests (sets PLAYWRIGHT_VERBOSE=true)
    -Headless   Run in headless mode (default: true)
    -Reporter   Use the HTML reporter instead of default dot reporter
    -TestFile   Run specific test file(s) (e.g. "applications-add.spec.ts")
    -Help       Show this help message
"@
    exit 0
}

# Set PLAYWRIGHT_VERBOSE environment variable based on parameter
$env:PLAYWRIGHT_VERBOSE = if ($Verbose) { "true" } else { "false" }

# Configure headless mode
$headedArg = if ($Headed) { "--headed" } else { "" }

# Configure reporter
$reporterArg = if ($Reporter) { "--reporter=html" } else { "--reporter=dot" }

# Build command with any specified test file
$testFileArg = ""
if ($TestFile -ne "") {
    $testFileArg = "./apps/web/tests/e2e/$TestFile"
}

# Display test run configuration
Write-Host "Running Playwright tests with:" -ForegroundColor Cyan
Write-Host "- Verbose logging: $(if ($Verbose) { 'Enabled' } else { 'Disabled' })" -ForegroundColor Cyan
Write-Host "- Headed mode: $(if ($Headed) { 'Enabled' } else { 'Disabled' })" -ForegroundColor Cyan
Write-Host "- Reporter: $(if ($Reporter) { 'HTML' } else { 'Dot' })" -ForegroundColor Cyan
if ($TestFile -ne "") {
    Write-Host "- Test file: $TestFile" -ForegroundColor Cyan
}
Write-Host ""

# Run the tests
$command = "npx playwright test $headedArg $reporterArg $testFileArg"
Write-Host "Executing: $command" -ForegroundColor Green
Invoke-Expression $command

# Show location of report if HTML reporter was used
if ($Reporter) {
    Write-Host "`nHTML report is available at ./playwright-report/index.html" -ForegroundColor Yellow
}