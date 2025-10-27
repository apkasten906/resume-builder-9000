#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build all packages in the correct dependency order

.DESCRIPTION
    This script ensures packages are built in the correct order:
    1. packages/core (foundation package)
    2. packages/api (depends on core)
    3. apps/web (depends on core)

.EXAMPLE
    .\scripts\build-packages.ps1
    Build all packages in dependency order
#>

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Building packages in dependency order..." -ForegroundColor Cyan

try {
    # 1. Build core package first (required by other packages)
    Write-Host "1/3 Building @rb9k/core..." -ForegroundColor Yellow
    Set-Location "$RepoRoot\packages\core"
    npm run build

    # 2. Build API package (depends on core)
    Write-Host "2/3 Building @rb9k/api..." -ForegroundColor Yellow
    Set-Location "$RepoRoot\packages\api"
    npm run build

    # 3. Build web package (depends on core)
    Write-Host "3/3 Building @rb9k/web..." -ForegroundColor Yellow
    Set-Location "$RepoRoot\apps\web"
    npm run build

    Write-Host "All packages built successfully!" -ForegroundColor Green

}
catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Set-Location $RepoRoot
}
