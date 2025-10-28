#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Configure Playwright for Docker testing environment

.DESCRIPTION
    This script helps configure your .env file for testing against Docker containers.
    It sets the appropriate ports and URLs for Playwright to connect to your Docker services.

.PARAMETER Mode
    The mode to configure: 'docker' or 'dev' (default: 'dev')

.PARAMETER Restore
    Restore from .env.example (ignores Mode parameter)

.EXAMPLE
    .\scripts\configure-playwright.ps1 -Mode docker
    Configure for testing against Docker containers on ports 8080/8081

.EXAMPLE
    .\scripts\configure-playwright.ps1 -Mode dev
    Configure for testing against development servers on ports 3000/4000

.EXAMPLE
    .\scripts\configure-playwright.ps1 -Restore
    Restore .env from .env.example template
#>

param(
  [ValidateSet('docker', 'dev')]
  [string]$Mode = 'dev',

  [switch]$Restore
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot

function Write-ColorOutput {
  param(
    [string]$Message,
    [string]$Color = 'White'
  )

  $ColorMap = @{
    'Green'  = [ConsoleColor]::Green
    'Yellow' = [ConsoleColor]::Yellow
    'Red'    = [ConsoleColor]::Red
    'Blue'   = [ConsoleColor]::Blue
    'Cyan'   = [ConsoleColor]::Cyan
    'White'  = [ConsoleColor]::White
  }

  Write-Host $Message -ForegroundColor $ColorMap[$Color]
}

function Update-EnvFile {
  param(
    [string]$FilePath,
    [hashtable]$Updates
  )

  if (-not (Test-Path $FilePath)) {
    Write-ColorOutput "Creating .env file from .env.example..." -Color Yellow
    Copy-Item "$RepoRoot\.env.example" $FilePath
  }

  $content = Get-Content $FilePath

  foreach ($key in $Updates.Keys) {
    $value = $Updates[$key]
    $pattern = "^$key="

    $found = $false
    for ($i = 0; $i -lt $content.Length; $i++) {
      if ($content[$i] -match $pattern) {
        $content[$i] = "$key=$value"
        $found = $true
        break
      }
    }

    if (-not $found) {
      Write-ColorOutput "Adding new environment variable: $key" -Color Blue
      $content += "$key=$value"
    }
  }

  Set-Content $FilePath $content
}

try {
  Write-ColorOutput "=== Playwright Configuration Script ===" -Color Cyan

  $envFile = Join-Path $RepoRoot '.env'

  if ($Restore) {
    Write-ColorOutput "Restoring .env from .env.example..." -Color Yellow
    Copy-Item "$RepoRoot\.env.example" $envFile -Force
    Write-ColorOutput "Success: .env restored from template" -Color Green
    return
  }

  if ($Mode -eq 'docker') {
    Write-ColorOutput "Configuring Playwright for Docker testing..." -Color Blue

    $updates = @{
      'WEB_BASE'            = 'http://localhost:8080'
      'API_BASE'            = 'http://localhost:8081'
      'PLAYWRIGHT_WEB_PORT' = '8080'
      'PLAYWRIGHT_API_PORT' = '8081'
      'PLAYWRIGHT_TEST'     = 'true'
      'PLAYWRIGHT_HEADLESS' = 'false'
      'ENABLE_TEST_ROUTES'  = 'true'
    }

    Update-EnvFile $envFile $updates

    Write-ColorOutput "Success: Configured for Docker testing:" -Color Green
    Write-ColorOutput "  - Web frontend: http://localhost:8080" -Color White
    Write-ColorOutput "  - API backend: http://localhost:8081" -Color White
    Write-ColorOutput "" -Color White
    Write-ColorOutput "Next steps:" -Color Yellow
    Write-ColorOutput "1. Start your Docker containers: docker-compose up -d" -Color White
    Write-ColorOutput "2. Ensure TEST_ROUTE_SECRET is set in your .env" -Color White
    Write-ColorOutput "3. Run Playwright tests from VS Code or command line" -Color White

  }
  elseif ($Mode -eq 'dev') {
    Write-ColorOutput "Configuring Playwright for development testing..." -Color Blue

    $updates = @{
      'WEB_BASE'            = 'http://localhost:3000'
      'API_BASE'            = 'http://localhost:4000'
      'PLAYWRIGHT_WEB_PORT' = '3000'
      'PLAYWRIGHT_API_PORT' = '4000'
      'PLAYWRIGHT_TEST'     = 'true'
      'PLAYWRIGHT_HEADLESS' = 'false'
      'ENABLE_TEST_ROUTES'  = 'true'
    }

    Update-EnvFile $envFile $updates

    Write-ColorOutput "Success: Configured for development testing:" -Color Green
    Write-ColorOutput "  - Web frontend: http://localhost:3000" -Color White
    Write-ColorOutput "  - API backend: http://localhost:4000" -Color White
    Write-ColorOutput "" -Color White
    Write-ColorOutput "Next steps:" -Color Yellow
    Write-ColorOutput "1. Start development servers: .\dev.ps1" -Color White
    Write-ColorOutput "2. Ensure TEST_ROUTE_SECRET is set in your .env" -Color White
    Write-ColorOutput "3. Run Playwright tests from VS Code or command line" -Color White
  }

}
catch {
  Write-ColorOutput "Error: $($_.Exception.Message)" -Color Red
  exit 1
}
