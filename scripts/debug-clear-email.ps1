# Debug helper: post to /__test/clear-emails and show response + outbox
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\debug-clear-email.ps1

$envFile = Join-Path (Get-Location) '.env'
if (-Not (Test-Path $envFile)) {
  Write-Error ".env not found at $envFile"
  exit 2
}

# read TEST_ROUTE_SECRET from .env
$line = Get-Content $envFile | Where-Object { $_ -match '^TEST_ROUTE_SECRET=' } | Select-Object -First 1
if (-not $line) {
  Write-Error 'TEST_ROUTE_SECRET not found in .env'
  exit 2
}
$secret = $line -replace '^TEST_ROUTE_SECRET=', ''
Write-Host "Using TEST_ROUTE_SECRET: $secret"

$api = 'http://localhost:4000'

try {
  Write-Host "POST $api/__test/clear-emails"
  $clear = Invoke-WebRequest -Uri "$api/__test/clear-emails" -Method Post -Headers @{ 'x-test-secret' = $secret } -UseBasicParsing -ErrorAction Stop
  Write-Host "Status: $($clear.StatusCode)"
  Write-Host "Body: $($clear.Content)"
}
catch {
  Write-Error "POST failed: $($_.Exception.Message)"
}

try {
  Write-Host "GET $api/__test/emails"
  $get = Invoke-WebRequest -Uri "$api/__test/emails" -Method Get -Headers @{ 'x-test-secret' = $secret } -UseBasicParsing -ErrorAction Stop
  Write-Host "Status: $($get.StatusCode)"
  Write-Host "Body: $($get.Content)"
}
catch {
  Write-Error "GET failed: $($_.Exception.Message)"
}
