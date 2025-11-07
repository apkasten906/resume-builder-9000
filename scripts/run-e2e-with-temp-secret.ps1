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

# Persist these values into .env temporarily so processes started with Start-Process
# (PowerShell 5.1) will see them when they read .env. We'll restore the file after tests.
$envFile = Join-Path $PSScriptRoot '..\.env'
$originalEnvContent = $null
$addedEnable = $false
$addedSecret = $false
if (Test-Path $envFile) {
  $originalEnvContent = Get-Content -Raw -Path $envFile
  # Replace or add ENABLE_TEST_ROUTES
  if ($originalEnvContent -match '(?im)^ENABLE_TEST_ROUTES\s*=') {
    $newContent = $originalEnvContent -replace '(?im)^ENABLE_TEST_ROUTES\s*=.*$', "ENABLE_TEST_ROUTES=$($env:ENABLE_TEST_ROUTES)"
  }
  else {
    $newContent = $originalEnvContent + "`nENABLE_TEST_ROUTES=$($env:ENABLE_TEST_ROUTES)"
    $addedEnable = $true
  }
  # Replace or add TEST_ROUTE_SECRET
  if ($newContent -match '(?im)^TEST_ROUTE_SECRET\s*=') {
    $newContent = $newContent -replace '(?im)^TEST_ROUTE_SECRET\s*=.*$', "TEST_ROUTE_SECRET=$($env:TEST_ROUTE_SECRET)"
  }
  else {
    $newContent = $newContent + "`nTEST_ROUTE_SECRET=$($env:TEST_ROUTE_SECRET)"
    $addedSecret = $true
  }
  Set-Content -Path $envFile -Value $newContent
  Write-Host ".env temporarily updated with TEST_ROUTE_SECRET and ENABLE_TEST_ROUTES for child processes" -ForegroundColor Yellow
}
else {
  # Create a minimal .env containing the needed keys
  $newContent = "ENABLE_TEST_ROUTES=$($env:ENABLE_TEST_ROUTES)`nTEST_ROUTE_SECRET=$($env:TEST_ROUTE_SECRET)"
  Set-Content -Path $envFile -Value $newContent
  $addedEnable = $true
  $addedSecret = $true
  Write-Host ".env created with TEST_ROUTE_SECRET and ENABLE_TEST_ROUTES (do not commit)" -ForegroundColor Yellow
}

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

# Restore .env to original state if we modified or created it
try {
  if ($null -ne $originalEnvContent) {
    Set-Content -Path $envFile -Value $originalEnvContent
    Write-Host "Restored original .env content." -ForegroundColor Yellow
  }
  else {
    # We created a minimal .env earlier; remove it to avoid leaving secrets on disk
    if ($addedEnable -or $addedSecret) {
      if (Test-Path $envFile) {
        Remove-Item -Path $envFile -Force
        Write-Host "Removed temporary .env created for E2E run." -ForegroundColor Yellow
      }
    }
  }
}
catch {
  Write-Host "Warning: failed to restore .env file: $_" -ForegroundColor Yellow
}
