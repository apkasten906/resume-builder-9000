# Run a single Playwright spec while loading TEST_ROUTE_SECRET from repo .env
param(
  [string]$SpecPath = 'apps/web/tests/e2e/resend-verification.spec.ts',
  [string]$Project = 'web-e2e'
)

$envFile = Join-Path (Get-Location) '.env'
if (-not (Test-Path $envFile)) { Write-Error '.env not found'; exit 2 }
$line = Get-Content $envFile | Where-Object { $_ -match '^TEST_ROUTE_SECRET=' } | Select-Object -First 1
if (-not $line) { Write-Error 'TEST_ROUTE_SECRET not found in .env'; exit 2 }
$secret = $line -replace '^TEST_ROUTE_SECRET=', ''
Write-Host "Using TEST_ROUTE_SECRET: $secret"

# Export into the current process environment and spawn Playwright
$env:TEST_ROUTE_SECRET = $secret
Write-Host "Running Playwright spec: $SpecPath (project: $Project)"
# Use npx to ensure local playwright is used
npx playwright test $SpecPath --project=$Project --reporter=dot
