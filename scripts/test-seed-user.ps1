# Test the seed-unverified-user endpoint
$envFile = Join-Path $PSScriptRoot '..\.env'
$secret = (Get-Content $envFile | Select-String 'TEST_ROUTE_SECRET=(.*)').Matches.Groups[1].Value.Trim()

Write-Host "Using TEST_ROUTE_SECRET: $secret"
Write-Host ""

$headers = @{
  'x-test-secret' = $secret
  'Content-Type'  = 'application/json'
}

$body = @{
  email    = 'unverified@example.com'
  password = 'password123'
} | ConvertTo-Json

try {
  Write-Host "POST /__test/seed-unverified-user"
  $response = Invoke-RestMethod -Uri 'http://localhost:4000/__test/seed-unverified-user' -Method POST -Headers $headers -Body $body
  Write-Host "Status: 200 OK"
  Write-Host "Response: $($response | ConvertTo-Json -Compress)"
}
catch {
  Write-Host "Status: $($_.Exception.Response.StatusCode.value__) $($_.Exception.Response.StatusDescription)"
  try {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Body: $responseBody"
  }
  catch {
    Write-Host "Could not read response body"
  }
}
