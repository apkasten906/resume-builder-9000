<#
.SYNOPSIS
  Purge a file from the repository history using git-filter-repo.

.DESCRIPTION
  This script performs a careful, documented history rewrite to remove
  `packages/api/.env.local` from all refs in the repository mirror, then
  pushes the rewritten mirror back to origin. It is intentionally
  interactive and requires confirmation before destructive operations.

  IMPORTANT: This rewrites history. All contributors must re-clone after
  the operation. Coordinate with your team before running.

.NOTES
  - Requires: git, python (3.8+), git-filter-repo (pip install git-filter-repo)
  - Run this from a machine where you have credentials to push to the repo.
#>

param(
  [string] $RepoUrl = $(git remote get-url origin 2>$null),
  [string] $MirrorDir = "repo-mirror.git",
  [string] $PathsToRemove = "packages/api/.env.local",
  [switch] $DryRun
)

function Confirm-Action($msg) {
  Write-Host "`n$msg`n" -ForegroundColor Yellow
  $resp = Read-Host "Type 'YES' to proceed"
  return $resp -eq 'YES'
}

if (-not $RepoUrl) {
  $RepoUrl = Read-Host "Enter the repo URL to mirror (e.g. https://github.com/org/repo.git)"
}

Write-Host "About to purge paths: $PathsToRemove from repo: $RepoUrl" -ForegroundColor Cyan
if (-not (Confirm-Action "This will rewrite history and force-push to origin. Have you coordinated with your team?")) {
  Write-Host "Cancelled by user." -ForegroundColor Red
  exit 1
}

if ($DryRun) {
  Write-Host "Dry run mode: no destructive push will be performed." -ForegroundColor Yellow
}

# Check git-filter-repo availability
try {
  git filter-repo --version > $null 2>&1
} catch {
  Write-Host "git-filter-repo not found. Please install it first." -ForegroundColor Red
  Write-Host "Install: python -m pip install --user git-filter-repo" -ForegroundColor Green
  exit 1
}

if (Test-Path $MirrorDir) {
  Write-Host "Removing existing mirror dir: $MirrorDir" -ForegroundColor Yellow
  Remove-Item -Recurse -Force $MirrorDir
}

Write-Host "Cloning repository as a mirror..." -ForegroundColor Cyan
git clone --mirror $RepoUrl $MirrorDir
if ($LASTEXITCODE -ne 0) { Write-Host "git clone failed" -ForegroundColor Red; exit 1 }

Push-Location $MirrorDir

Write-Host "Running git-filter-repo to remove: $PathsToRemove" -ForegroundColor Cyan
# Use --invert-paths to remove the listed paths from history
git filter-repo --invert-paths --paths $PathsToRemove
if ($LASTEXITCODE -ne 0) { Write-Host "git-filter-repo failed" -ForegroundColor Red; Pop-Location; exit 1 }

if ($DryRun) {
  Write-Host "Dry run - skipping push. Inspect the mirror in $PWD" -ForegroundColor Yellow
  Pop-Location
  exit 0
}

if (-not (Confirm-Action "Ready to force-push rewritten history BACK to origin. This will overwrite remote refs. Continue?")) {
  Write-Host "Aborted by user." -ForegroundColor Red
  Pop-Location
  exit 1
}

Write-Host "Pushing rewritten history to origin (force)" -ForegroundColor Cyan
# Push everything forcefully
git push --force --mirror origin
if ($LASTEXITCODE -ne 0) { Write-Host "git push failed" -ForegroundColor Red; Pop-Location; exit 1 }

Write-Host "Success: history rewritten and pushed. Notify all contributors to re-clone." -ForegroundColor Green
Pop-Location

Write-Host "Post-purge checklist:" -ForegroundColor Cyan
Write-Host " - Ask all contributors to re-clone the repository or reset their local branches." -ForegroundColor White
Write-Host " - Rotate any secrets that were exposed (done prior to purge)." -ForegroundColor White
