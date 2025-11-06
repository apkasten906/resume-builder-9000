#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Removes duplicate JavaScript files that have corresponding TypeScript versions
.DESCRIPTION
    This script scans the entire repository for .js files that have corresponding .ts or .tsx files
    and removes the .js duplicates to prevent import resolution conflicts.
.PARAMETER DryRun
    If specified, only shows what would be removed without actually deleting files
.PARAMETER Verbose
    If specified, shows detailed output during the cleanup process
.EXAMPLE
    .\cleanup-duplicate-js-files.ps1 -DryRun
    Shows what files would be removed without actually deleting them
.EXAMPLE
    .\cleanup-duplicate-js-files.ps1 -Verbose
    Removes duplicate files with detailed output
#>

param(
  [switch]$DryRun,
  [switch]$Verbose
)

# Set up error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "`e[91m"
$Green = "`e[92m"
$Yellow = "`e[93m"
$Blue = "`e[94m"
$Reset = "`e[0m"

function Write-ColorOutput {
  param([string]$Message, [string]$Color = $Reset)
  Write-Host "$Color$Message$Reset"
}

function Write-Header {
  param([string]$Title)
  Write-ColorOutput "`n=== $Title ===" $Blue
}

function Write-Success {
  param([string]$Message)
  Write-ColorOutput "[PASS] $Message" $Green
}

function Write-Warning {
  param([string]$Message)
  Write-ColorOutput "[WARN]  $Message" $Yellow
}

function Write-Error {
  param([string]$Message)
  Write-ColorOutput "[ERROR] $Message" $Red
}

# Directories to exclude from scanning
$ExcludePatterns = @(
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "playwright-report"
)

# Files to never remove (even if they have TS counterparts)
$PreserveFiles = @(
  "next.config.js",
  "tailwind.config.js",
  "postcss.config.js",
  "eslint.config.js",
  ".eslintrc.js",
  "jest.config.js",
  "playwright.config.js"
)

Write-Header "JavaScript Duplicate File Cleanup Script"

if ($DryRun) {
  Write-Warning "DRY RUN MODE - No files will be deleted"
}

Write-ColorOutput "Scanning repository for duplicate JavaScript files..." $Blue

# Get the repository root (current directory)
$RepoRoot = Get-Location
Write-ColorOutput "Repository root: $RepoRoot" $Blue

# Find all .js files excluding specified directories
$AllJsFiles = @()
Get-ChildItem -Path $RepoRoot -Recurse -Filter "*.js" -File | ForEach-Object {
  $ShouldExclude = $false
  foreach ($pattern in $ExcludePatterns) {
    if ($_.FullName -like "*\$pattern\*") {
      $ShouldExclude = $true
      break
    }
  }
  if (-not $ShouldExclude) {
    $AllJsFiles += $_
  }
}

Write-ColorOutput "Found $($AllJsFiles.Count) JavaScript files to check" $Blue

# Arrays to track results
$DuplicatesFound = @()
$FilesRemoved = @()
$FilesPreserved = @()
$ScriptErrors = @()

# Check each .js file for corresponding .ts/.tsx versions
foreach ($JsFile in $AllJsFiles) {
  try {
    $BaseName = [System.IO.Path]::GetFileNameWithoutExtension($JsFile.Name)
    $Directory = $JsFile.Directory.FullName

    # Check if this file should be preserved
    if ($PreserveFiles -contains $JsFile.Name) {
      $FilesPreserved += $JsFile.FullName
      if ($Verbose) {
        Write-ColorOutput "PRESERVED: $($JsFile.FullName) (configuration file)" $Yellow
      }
      continue
    }

    # Look for corresponding TypeScript files
    $TsFile = Join-Path $Directory "$BaseName.ts"
    $TsxFile = Join-Path $Directory "$BaseName.tsx"

    $HasTs = Test-Path $TsFile
    $HasTsx = Test-Path $TsxFile

    if ($HasTs -or $HasTsx) {
      $DuplicatesFound += $JsFile.FullName

      $RelativePath = $JsFile.FullName.Replace($RepoRoot.Path, "").TrimStart('\')

      if ($Verbose -or $DryRun) {
        Write-ColorOutput "DUPLICATE: $RelativePath" $Red
        if ($HasTs) {
          $TsRelative = $TsFile.Replace($RepoRoot.Path, "").TrimStart('\')
          Write-ColorOutput "  -> Has TypeScript version: $TsRelative" $Yellow
        }
        if ($HasTsx) {
          $TsxRelative = $TsxFile.Replace($RepoRoot.Path, "").TrimStart('\')
          Write-ColorOutput "  -> Has TSX version: $TsxRelative" $Yellow
        }
      }

      # Remove the file unless in dry run mode
      if (-not $DryRun) {
        Remove-Item $JsFile.FullName -Force
        $FilesRemoved += $JsFile.FullName
        if ($Verbose) {
          Write-Success "Removed: $RelativePath"
        }
      }
    }
  }
  catch {
    $ErrorMsg = "Error processing $($JsFile.FullName): $($_.Exception.Message)"
    $ScriptErrors += $ErrorMsg
    Write-Error $ErrorMsg
  }
}

# Update package.json files that reference removed .mjs configs
Write-Header "Updating package.json files"

$PackageJsonFiles = Get-ChildItem -Path $RepoRoot -Recurse -Filter "package.json" -File | Where-Object {
  $ShouldExclude = $false
  foreach ($pattern in $ExcludePatterns) {
    if ($_.FullName -like "*\$pattern\*") {
      $ShouldExclude = $true
      break
    }
  }
  -not $ShouldExclude
}

foreach ($PackageFile in $PackageJsonFiles) {
  try {
    $Content = Get-Content $PackageFile.FullName -Raw
    $Modified = $false

    # Replace .mjs references with .ts in test scripts
    if ($Content -match "vitest\.config\.mjs") {
      $NewContent = $Content -replace "vitest\.config\.mjs", "vitest.config.ts"
      if ($NewContent -ne $Content) {
        $Modified = $true
        $Content = $NewContent
      }
    }

    # Save changes if modifications were made
    if ($Modified -and -not $DryRun) {
      Set-Content -Path $PackageFile.FullName -Value $Content -NoNewline
      $RelativePath = $PackageFile.FullName.Replace($RepoRoot.Path, "").TrimStart('\')
      Write-Success "Updated package.json: $RelativePath"
    }
    elseif ($Modified -and $DryRun) {
      $RelativePath = $PackageFile.FullName.Replace($RepoRoot.Path, "").TrimStart('\')
      Write-ColorOutput "WOULD UPDATE: $RelativePath (vitest.config.mjs -> vitest.config.ts)" $Yellow
    }
  }
  catch {
    $ErrorMsg = "Error updating $($PackageFile.FullName): $($_.Exception.Message)"
    $Errors += $ErrorMsg
    Write-Error $ErrorMsg
  }
}

# Final summary
Write-Header "Cleanup Summary"

Write-ColorOutput "Total JavaScript files scanned: $($AllJsFiles.Count)" $Blue
Write-ColorOutput "Duplicate files found: $($DuplicatesFound.Count)" $Yellow
Write-ColorOutput "Files preserved (config): $($FilesPreserved.Count)" $Green

if ($DryRun) {
  Write-ColorOutput "Files that WOULD BE removed: $($DuplicatesFound.Count)" $Yellow
}
else {
  Write-ColorOutput "Files removed: $($FilesRemoved.Count)" $Green
}

if ($ScriptErrors.Count -gt 0) {
  Write-ColorOutput "Errors encountered: $($ScriptErrors.Count)" $Red
  foreach ($ErrorMsg in $ScriptErrors) {
    Write-ColorOutput "  $ErrorMsg" $Red
  }
}

if (-not $DryRun -and $FilesRemoved.Count -gt 0) {
  Write-Header "Verification"
  Write-ColorOutput "Running npm test to verify no build issues..." $Blue

  try {
    $TestResult = & npm test 2>&1
    if ($LASTEXITCODE -eq 0) {
      Write-Success "All tests pass! Cleanup was successful."
    }
    else {
      Write-Error "Tests failed after cleanup. You may need to investigate."
      Write-ColorOutput "Test output: $TestResult" $Red
    }
  }
  catch {
    Write-Warning "Could not run npm test. Please run it manually to verify the cleanup."
  }
}

if ($DryRun) {
  Write-ColorOutput "`nTo perform the actual cleanup, run:" $Blue
  Write-ColorOutput ".\scripts\cleanup-duplicate-js-files.ps1" $Green
}
else {
  Write-Success "`nCleanup complete! Your repository now uses TypeScript files consistently."
}
