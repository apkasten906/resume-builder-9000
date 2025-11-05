param(
  [switch]$PersistSecret,
  [switch]$Full
)

# Generate 32 bytes random secret
$bytes = New-Object 'System.Byte[]' 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Host "Generated TEST_ROUTE_SECRET (base64, hidden)"

# Export for this session so child processes inherit it
$env:ENABLE_TEST_ROUTES = 'true'
$env:TEST_ROUTE_SECRET = $secret

# Optionally persist
if ($PersistSecret) {
  $envFile = Join-Path $PSScriptRoot '..\.env'
  if (Test-Path $envFile) {
    $content = Get-Content -Raw -Path $envFile
    if ($content -match '(?im)^TEST_ROUTE_SECRET\s*=') {
      $newContent = $content -replace '(?im)^TEST_ROUTE_SECRET\s*=.*$', "TEST_ROUTE_SECRET=$secret"
      Set-Content -Path $envFile -Value $newContent
    }
    else {
      Add-Content -Path $envFile -Value "`nTEST_ROUTE_SECRET=$secret"
    }
    Write-Host ".env updated with TEST_ROUTE_SECRET (do not commit .env)" -ForegroundColor Yellow
  }
  else {
    Write-Host '.env not found — secret will remain in-session only' -ForegroundColor Yellow
  }
}

# Start dev.ps1 in a separate process (it will inherit current env vars)
$devPath = Join-Path $PSScriptRoot '..\dev.ps1'
Write-Host "Starting dev script: $devPath"

# Quote the dev script path in a single argument string so paths with spaces are handled correctly.
$argString = "-NoProfile -ExecutionPolicy Bypass -File `"$devPath`""
# Use the repository root as the working directory so dev.ps1 sees the repo-level files (e.g. .env.example) and npm workspaces.
$repoRoot = Join-Path $PSScriptRoot '..'
Start-Process -NoNewWindow -FilePath 'powershell.exe' -ArgumentList $argString -WorkingDirectory $repoRoot -PassThru | Out-Null

# Wait for API health
$healthUrl = 'http://localhost:4000/api/health'
Write-Host 'Waiting for API to become healthy...'
for ($i = 0; $i -lt 90; $i++) {
  try {
    $r = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
    if ($r -and $r.status) { Write-Host 'API healthy'; break }
  }
  catch {
    Start-Sleep -Seconds 2
    Write-Host "waiting for api... ($($i+1))"
  }
}

# Run Playwright tests (will inherit TEST_ROUTE_SECRET from env)
Write-Host 'Running Playwright tests...'
$npx = 'npx'
if ($Full) {
  # Run the full workspace-scoped web-e2e project
  $testCmd = "$npx playwright test --config=playwright.workspace.config.ts --project=web-e2e --reporter=dot"
}
else {
  # Default: run a single fast test used for smoke verification
  $testCmd = "$npx playwright test apps/web/tests/e2e/resend-verification.spec.ts --config=playwright.workspace.config.ts --project=web-e2e --reporter=dot"
}
Write-Host "Executing: $testCmd"
Invoke-Expression $testCmd
$exit = $LASTEXITCODE
Write-Host "Playwright exit code: $exit"
if ($exit -ne 0) { exit $exit }
