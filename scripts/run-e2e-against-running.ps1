param(
  [string]$TestPath = "apps/web/tests/e2e/resume-upload.spec.ts",
  [string]$Grep = "uploaded resume is persisted and parsed fields are stored",
  [string]$PlaywrightConfig = "apps/web/tests/e2e/playwright.local.config.ts"
)

# Run Playwright against already-running dev servers.
Write-Host "Running Playwright tests against running dev servers..."

# Ensure environment variables point to typical dev.ps1 defaults; override if already set.
$env:PLAYWRIGHT_REUSE_EXISTING_SERVERS = '1'
if (-not $env:WEB_BASE -or $env:WEB_BASE -eq '') {
  $env:WEB_BASE = 'http://localhost:3001'
}
if (-not $env:API_BASE -or $env:API_BASE -eq '') {
  $env:API_BASE = 'http://localhost:4001'
}

Write-Host "PLAYWRIGHT_REUSE_EXISTING_SERVERS=$($env:PLAYWRIGHT_REUSE_EXISTING_SERVERS)"
Write-Host "WEB_BASE=$($env:WEB_BASE)"
Write-Host "API_BASE=$($env:API_BASE)"

# Give Next.js a moment to hot-reload if source files were recently changed
Write-Host "Waiting 10 seconds for Next.js hot reload..."
Start-Sleep -Seconds 10

npx playwright test $TestPath -g $Grep --config=$PlaywrightConfig --timeout=60000
