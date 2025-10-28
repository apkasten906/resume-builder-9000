<#
PowerShell helper to run Playwright in the same environment Test Explorer uses.
This script sets the common env vars used when running Playwright against Docker
containers and then invokes the Playwright CLI with any passed arguments.

Usage (from repo root):
  .\scripts\run-playwright-test-explorer.ps1            # runs all tests
  .\scripts\run-playwright-test-explorer.ps1 -Args "tests/my.spec.ts"  # run specific spec

This is intended for reproducible runs from VS Code Test Explorer or CI.
#>
param(
  [string] $PlaywrightArgs
)

# Make sure script runs from repository root
Set-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)\.. | Out-Null

# Environment defaults (can be overridden in the shell or by a .env file)
$env:DOCKER_TESTING = $env:DOCKER_TESTING -or 'true'
$env:PLAYWRIGHT_WEB_PORT = $env:PLAYWRIGHT_WEB_PORT -or '8080'
$env:PLAYWRIGHT_API_PORT = $env:PLAYWRIGHT_API_PORT -or '8081'
$env:WEB_BASE = $env:WEB_BASE -or "http://localhost:$($env:PLAYWRIGHT_WEB_PORT)"
$env:API_BASE = $env:API_BASE -or "http://localhost:$($env:PLAYWRIGHT_API_PORT)"
$env:PLAYWRIGHT_HEADLESS = $env:PLAYWRIGHT_HEADLESS -or 'true'
$env:PLAYWRIGHT_TEST = $env:PLAYWRIGHT_TEST -or 'true'

Write-Host "Running Playwright with:" -ForegroundColor Cyan
Write-Host "  DOCKER_TESTING=$($env:DOCKER_TESTING)"
Write-Host "  WEB_BASE=$($env:WEB_BASE)"
Write-Host "  API_BASE=$($env:API_BASE)"
Write-Host "  PLAYWRIGHT_HEADLESS=$($env:PLAYWRIGHT_HEADLESS)"

# Forward all args to npx playwright test; if -Args passed, use that; otherwise pass through $args
if ($PlaywrightArgs) {
  npx playwright test $PlaywrightArgs
} else {
  npx playwright test
}
