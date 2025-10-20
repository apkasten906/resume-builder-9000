#!/usr/bin/env pwsh
<#
.SYNOPSIS
Helper script to manually test email verification flow

.DESCRIPTION
This script automates the email verification testing process by:
1. Logging in with your credentials (to get an auth token)
2. Calling the resend-verification endpoint (generates new token)
3. Fetching your verification token via the authenticated /auth/verification-token endpoint
4. Opening the verification URL in your browser

.PARAMETER Email
The email address to test verification for (defaults to apkasten@gmail.com)

.PARAMETER Password
The password for the account (will prompt if not provided)

.PARAMETER ApiUrl
The API base URL (defaults to http://localhost:4000)

.PARAMETER WebUrl
The web base URL (defaults to http://localhost:3000)

.PARAMETER UseTestEndpoint
Use the test endpoint (requires TEST_ROUTE_SECRET) instead of authenticated endpoint

.EXAMPLE
.\scripts\test-email-verification.ps1
Test verification for the default email (apkasten@gmail.com) - will prompt for password
NOTE: The account must already be registered (but unverified)

.EXAMPLE
.\scripts\test-email-verification.ps1 -Email "test@example.com" -Password "MyPassword123!"
Test verification for a custom email address with password provided
NOTE: The account must already be registered (but unverified)

.EXAMPLE
.\scripts\test-email-verification.ps1 -UseTestEndpoint
Use the test endpoint method (requires TEST_ROUTE_SECRET and loads from .env file automatically)
#>

param(
  [string]$Email = "apkasten@gmail.com",
  [string]$Password,
  [string]$ApiUrl = "http://localhost:4000",
  [string]$WebUrl = "http://localhost:3000",
  [switch]$UseTestEndpoint
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Email Verification Testing Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to load .env file
function Import-DotEnv {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    # Skip empty lines and comments
    if ($line -and -not $line.StartsWith('#')) {
      # Parse KEY=VALUE format
      if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        $value = $value -replace '^[''"]|[''"]$', ''

        # Validate key name: only allow alphanumeric and underscores, starting with a letter or underscore
        if ($key -match '^[A-Za-z_][A-Za-z0-9_]*$') {
          [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
        }
        else {
          Write-Warning "Skipping invalid environment variable key: '$key'"
        }
      }
    }
  }
}

# Load environment variables from root .env file
$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env"
if (Test-Path $envPath) {
  Import-DotEnv -Path $envPath
  Write-Verbose "Loaded environment variables from $envPath"
}

try {
  $token = $null
  $verificationUrl = $null

  if ($UseTestEndpoint) {
    # Old method: Use test endpoint (requires TEST_ROUTE_SECRET)
    Write-Host "Using test endpoint method (requires TEST_ROUTE_SECRET)..." -ForegroundColor Cyan
    Write-Host ""

    $testSecret = $env:TEST_ROUTE_SECRET
    if (-not $testSecret) {
      Write-Host "ERROR: TEST_ROUTE_SECRET environment variable not set" -ForegroundColor Red
      Write-Host "This is required to access the test endpoints" -ForegroundColor Yellow
      Write-Host ""
      Write-Host "The script tried to load it from: $envPath" -ForegroundColor Yellow
      Write-Host "Please ensure TEST_ROUTE_SECRET is set in your .env file, or use the authenticated method instead:" -ForegroundColor Yellow
      Write-Host "  .\scripts\test-email-verification.ps1" -ForegroundColor Cyan
      exit 1
    }

    # Step 1: Call resend-verification
    Write-Host "Step 1: Sending verification email to $Email..." -ForegroundColor Yellow
    $resendBody = @{ email = $Email } | ConvertTo-Json
    $resendResponse = Invoke-RestMethod `
      -Uri "$ApiUrl/auth/resend-verification" `
      -Method POST `
      -ContentType "application/json" `
      -Body $resendBody

    Write-Host "  - Email sent successfully" -ForegroundColor Green
    Write-Host ""

    # Step 2: Get emails from test endpoint
    Write-Host "Step 2: Fetching verification token from test endpoint..." -ForegroundColor Yellow
    $headers = @{ "x-test-secret" = $testSecret }
    $emails = Invoke-RestMethod -Uri "$ApiUrl/__test/emails" -Headers $headers

    $verificationEmail = $emails |
    Where-Object { $_.to -eq $Email -and $_.metadata.type -eq 'email-verification' } |
    Select-Object -Last 1

    if (-not $verificationEmail) {
      Write-Host "  - ERROR: No verification email found for $Email" -ForegroundColor Red
      exit 1
    }

    $token = $verificationEmail.metadata.token
  }
  else {
    # New method: Use authenticated endpoint (more secure, no TEST_ROUTE_SECRET needed)
    Write-Host "Using authenticated endpoint method (recommended)..." -ForegroundColor Cyan
    Write-Host ""

    # Get password if not provided
    if (-not $Password) {
      $securePassword = Read-Host -Prompt "Enter password for $Email" -AsSecureString
      $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
      $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }

    # Step 1: Login to get auth token
    Write-Host "Step 1: Logging in as $Email..." -ForegroundColor Yellow
    $loginBody = @{
      email    = $Email
      password = $Password
    } | ConvertTo-Json

    try {
      $loginResponse = Invoke-WebRequest `
        -Uri "$ApiUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -SessionVariable 'session' `
        -ErrorAction Stop

      $authToken = ($loginResponse.Content | ConvertFrom-Json).token
      Write-Host "  - Logged in successfully" -ForegroundColor Green
      Write-Host ""
    }
    catch {
      $statusCode = $_.Exception.Response.StatusCode.value__
      Write-Host "  - ERROR: Login failed" -ForegroundColor Red
      Write-Host ""

      if ($statusCode -eq 401) {
        Write-Host "Invalid credentials. Please check your email and password." -ForegroundColor Yellow
      }
      elseif ($statusCode -eq 403) {
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorData.error -match "email.*not.*confirmed") {
          Write-Host "Your account exists but is not verified yet - this is expected!" -ForegroundColor Green
          Write-Host "The authenticated endpoint requires a verified account to login." -ForegroundColor Yellow
          Write-Host ""
          Write-Host "For unverified accounts, use the test endpoint method:" -ForegroundColor Cyan
          Write-Host "  .\scripts\test-email-verification.ps1 -UseTestEndpoint" -ForegroundColor Cyan
        }
        else {
          Write-Host "Access forbidden: $($errorData.error)" -ForegroundColor Yellow
        }
      }
      else {
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor Gray
      }

      Write-Host ""
      Write-Host "TIP: If your account is not verified yet, use:" -ForegroundColor Yellow
      Write-Host "  .\scripts\test-email-verification.ps1 -UseTestEndpoint" -ForegroundColor Cyan
      exit 1
    }

    # Step 2: Call resend-verification
    Write-Host "Step 2: Generating new verification email..." -ForegroundColor Yellow
    $resendBody = @{ email = $Email } | ConvertTo-Json
    $resendResponse = Invoke-RestMethod `
      -Uri "$ApiUrl/auth/resend-verification" `
      -Method POST `
      -ContentType "application/json" `
      -Body $resendBody `
      -WebSession $session

    Write-Host "  - Verification email generated" -ForegroundColor Green
    Write-Host "  - Expires at: $($resendResponse.expiresAt)" -ForegroundColor Gray
    Write-Host ""

    # Step 3: Get verification token from authenticated endpoint
    Write-Host "Step 3: Fetching your verification token..." -ForegroundColor Yellow
    $tokenResponse = Invoke-RestMethod `
      -Uri "$ApiUrl/auth/verification-token" `
      -Method GET `
      -Headers @{ "Authorization" = "Bearer $authToken" } `
      -WebSession $session

    $token = $tokenResponse.token
    $verificationUrl = $tokenResponse.verificationUrl
  }

  Write-Host "  - Token retrieved successfully" -ForegroundColor Green
  Write-Host "  - Token: $token" -ForegroundColor Gray
  Write-Host ""

  # Build verification URL if not already provided
  if (-not $verificationUrl) {
    $verificationUrl = "$WebUrl/confirm-email?token=$token"
  }

  # Open in default browser
  Write-Host "Step 4: Opening verification URL in browser..." -ForegroundColor Yellow
  Write-Host "  - URL: $verificationUrl" -ForegroundColor Gray
  Write-Host ""

  Start-Process $verificationUrl

  Write-Host "========================================" -ForegroundColor Green
  Write-Host "SUCCESS!" -ForegroundColor Green
  Write-Host "========================================" -ForegroundColor Green
  Write-Host ""
  Write-Host "The verification page should now be open in your browser." -ForegroundColor White
  Write-Host ""
  Write-Host "What happens next:" -ForegroundColor Yellow
  Write-Host "  1. The page will verify the token automatically" -ForegroundColor Gray
  Write-Host "  2. If successful, you'll see a confirmation message" -ForegroundColor Gray
  Write-Host "  3. You can then log in with your verified account" -ForegroundColor Gray
  Write-Host ""

}
catch {
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Red
  Write-Host "ERROR" -ForegroundColor Red
  Write-Host "========================================" -ForegroundColor Red
  Write-Host ""
  Write-Host "Failed to test email verification:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ""

  if ($_.Exception.Response) {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP Status: $statusCode" -ForegroundColor Yellow

    if ($statusCode -eq 404) {
      Write-Host "User not found. Did you register $Email first?" -ForegroundColor Yellow
    }
    elseif ($statusCode -eq 400) {
      Write-Host "Email might already be verified." -ForegroundColor Yellow
    }
    elseif ($statusCode -eq 403) {
      Write-Host "Test route access denied. Check TEST_ROUTE_SECRET." -ForegroundColor Yellow
    }
  }

  Write-Host ""
  exit 1
}
