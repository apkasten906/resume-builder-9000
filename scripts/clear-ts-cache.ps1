#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Clears TypeScript cache to resolve type-checking issues.
.DESCRIPTION
    This script clears the TypeScript cache in various locations to help
    resolve issues with stale type definitions, incorrect type errors,
    or other TypeScript compilation problems.
.PARAMETER All
    Clear all TypeScript caches (Node modules, VS Code, and TypeScript server)
.PARAMETER NodeModules
    Clear only the Node modules cache (node_modules/.cache)
.PARAMETER VSCode
    Clear only the VS Code TypeScript cache
.PARAMETER TSServer
    Clear only the TypeScript server cache
.PARAMETER Help
    Show help message
.EXAMPLE
    ./clear-ts-cache.ps1 -All
.EXAMPLE
    ./clear-ts-cache.ps1 -NodeModules -VSCode
#>

param(
    [switch]$All,
    [switch]$NodeModules,
    [switch]$VSCode,
    [switch]$TSServer,
    [switch]$Help
)

# Show help if requested or no parameters provided
if ($Help -or (-not ($All -or $NodeModules -or $VSCode -or $TSServer))) {
    Write-Host @"
Clear TypeScript Cache

USAGE:
    ./clear-ts-cache.ps1 [-All] [-NodeModules] [-VSCode] [-TSServer] [-Help]

OPTIONS:
    -All           Clear all TypeScript caches
    -NodeModules   Clear Node modules cache (node_modules/.cache)
    -VSCode        Clear VS Code TypeScript cache
    -TSServer      Clear TypeScript server cache
    -Help          Show this help message

EXAMPLES:
    ./clear-ts-cache.ps1 -All
    ./clear-ts-cache.ps1 -NodeModules -VSCode
"@
    exit 0
}

$success = 0
$failed = 0

function Remove-CacheDirectory {
    param(
        [string]$Path,
        [string]$Description
    )

    Write-Host "Clearing $Description..." -ForegroundColor Cyan -NoNewline

    if (Test-Path -Path $Path) {
        try {
            Remove-Item -Path $Path -Recurse -Force
            Write-Host " Done!" -ForegroundColor Green
            return $true
        } catch {
            Write-Host " Failed!" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host " Not found (already clean)" -ForegroundColor Yellow
        return $true
    }
}

# Clear Node modules cache if requested
if ($All -or $NodeModules) {
    $nodeModulesCachePaths = @(
        "$PSScriptRoot/../node_modules/.cache",
        "$PSScriptRoot/../apps/web/node_modules/.cache",
        "$PSScriptRoot/../packages/api/node_modules/.cache",
        "$PSScriptRoot/../packages/core/node_modules/.cache"
    )

    foreach ($cachePath in $nodeModulesCachePaths) {
        if (Remove-CacheDirectory -Path $cachePath -Description "Node modules cache at $cachePath") {
            $success++
        } else {
            $failed++
        }
    }
}

# Clear VS Code TypeScript cache if requested
if ($All -or $VSCode) {
    $vscodeCachePath = "$env:APPDATA\Code\Cache\Cache_Data"
    $vscodeWorkspaceCachePath = "$PSScriptRoot/../.vscode/.cache"

    if (Remove-CacheDirectory -Path $vscodeCachePath -Description "VS Code cache") {
        $success++
    } else {
        $failed++
    }

    if (Remove-CacheDirectory -Path $vscodeWorkspaceCachePath -Description "VS Code workspace cache") {
        $success++
    } else {
        $failed++
    }
}

# Clear TypeScript server cache if requested
if ($All -or $TSServer) {
    $tsCachePaths = @(
        "$env:LOCALAPPDATA\Microsoft\TypeScript",
        "$env:TEMP\typescript-tsserver-*"
    )

    foreach ($cachePath in $tsCachePaths) {
        if (Remove-CacheDirectory -Path $cachePath -Description "TypeScript server cache at $cachePath") {
            $success++
        } else {
            $failed++
        }
    }
}

# Display summary
Write-Host "`nCache Clearing Summary:" -ForegroundColor Cyan
Write-Host "- Successful operations: $success" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "- Failed operations: $failed" -ForegroundColor Red
}

Write-Host "`nRecommended Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart VS Code if it's running" -ForegroundColor White
Write-Host "2. Restart any running TypeScript compilers or watchers" -ForegroundColor White
Write-Host "3. If using dev server, restart it with 'npm run dev'" -ForegroundColor White

exit $failed
