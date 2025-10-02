# Clean Script for Resume Builder 9000 Monorepo
# Usage:
#   powershell -ExecutionPolicy Bypass -File ./scripts/clean.ps1                      # Non-verbose mode (dots)
#   powershell -ExecutionPolicy Bypass -File ./scripts/clean.ps1 -VerboseOutput       # Verbose mode (detailed output)

param(
    [switch]$VerboseOutput
)

# Configure progress display
$ProgressPreference = 'SilentlyContinue'

if ($VerboseOutput) {
    Write-Host "Cleaning Resume Builder 9000 monorepo..." -ForegroundColor Cyan
} else {
    Write-Host "Cleaning" -NoNewline -ForegroundColor Cyan
}

# Helper function for progress indication
function Write-CleanProgress {
    param([string]$Message)
    if ($VerboseOutput) {
        Write-Host "   - $Message" -ForegroundColor Gray
    } else {
        Write-Host "." -NoNewline -ForegroundColor Green
    }
}

# Clean root directory
if ($VerboseOutput) { Write-Host "Root directory" -ForegroundColor Yellow }

# Remove root node_modules and lock files
if (Test-Path "node_modules") {
    Write-CleanProgress "node_modules"
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Write-CleanProgress "package-lock.json"
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
}
if (Test-Path "pnpm-lock.yaml") {
    Write-CleanProgress "pnpm-lock.yaml"
    Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
}
if (Test-Path "yarn.lock") {
    Write-CleanProgress "yarn.lock"
    Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
}

# Remove root build artifacts, caches, and logs
@(".next", "dist", "coverage", ".cache") | ForEach-Object {
    if (Test-Path $_) {
        Write-CleanProgress $_
        Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue
    }
}

# Remove TypeScript build info and log files
$buildFiles = Get-ChildItem -Include *.tsbuildinfo,*.log -ErrorAction SilentlyContinue
if ($buildFiles) {
    Write-CleanProgress "build files and logs"
    $buildFiles | Remove-Item -Force -ErrorAction SilentlyContinue
}

# Clean workspace directories
$workspaces = @(
    "apps/web",
    "packages/core",
    "packages/api"
)

foreach ($ws in $workspaces) {
    if ($VerboseOutput) { Write-Host "$ws" -ForegroundColor Yellow }

    # Node modules and lock files
    @("node_modules", "package-lock.json", "pnpm-lock.yaml", "yarn.lock") | ForEach-Object {
        $path = "$ws/$_"
        if (Test-Path $path) {
            Write-CleanProgress "$ws/$_"
            Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        }
    }

    # Build artifacts and caches
    @(".next", "dist", "coverage", ".cache") | ForEach-Object {
        $path = "$ws/$_"
        if (Test-Path $path) {
            Write-CleanProgress "$ws/$_"
            Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        }
    }

    # TypeScript build info and log files
    $buildFiles = Get-ChildItem -Path $ws -Include *.tsbuildinfo,*.log -ErrorAction SilentlyContinue
    if ($buildFiles) {
        Write-CleanProgress "$ws/build files"
        $buildFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

# Clean npm cache
if ($VerboseOutput) {
    Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
    npm cache clean --force
} else {
    Write-CleanProgress "npm cache"
    npm cache clean --force 2>$null | Out-Null
}

# Completion message
if ($VerboseOutput) {
    Write-Host "Clean complete!" -ForegroundColor Green
} else {
    Write-Host " Done" -ForegroundColor Green
}
