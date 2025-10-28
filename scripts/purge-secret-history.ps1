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
  [switch] $DryRun,
  [switch] $AutoConfirm
)

function Confirm-Action($msg) {
  if ($AutoConfirm) { Write-Host "Auto-confirm enabled; proceeding." -ForegroundColor Yellow; return $true }
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

# Check git-filter-repo availability (with optional installer)
function Test-GitFilterRepoAvailable {
  # Try calling via git (this will succeed if git can find git-filter-repo)
  & git filter-repo --version > $null 2>&1
  if ($LASTEXITCODE -eq 0) { return $true }

  # Try to locate the standalone script (installed by pip) on PATH
  $cmd = Get-Command git-filter-repo -ErrorAction SilentlyContinue
  if ($cmd) { return $true }

  return $false
}

function Get-PythonCommand {
  $py = Get-Command python -ErrorAction SilentlyContinue
  if ($py) { return 'python' }
  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) { return 'py -3' }
  return $null
}

if (-not (Test-GitFilterRepoAvailable)) {
  Write-Host "git-filter-repo not found on PATH or as a git subcommand." -ForegroundColor Yellow
  $install = Read-Host "Would you like this script to attempt installing via pip for the current user? (y/N)"
  if ($install -match '^(y|Y)') {
    $pythonCmd = Get-PythonCommand
    if (-not $pythonCmd) {
      Write-Host "Python not found in PATH. Please install Python 3.8+ and ensure 'python' or 'py' is available." -ForegroundColor Red
      Write-Host "Visit https://www.python.org/downloads/" -ForegroundColor Cyan
      exit 1
    }

    Write-Host "Attempting: $pythonCmd -m pip install --user git-filter-repo" -ForegroundColor Cyan
    # Use & to invoke the command string correctly
    if ($pythonCmd -eq 'python') {
      & python -m pip install --user git-filter-repo
    }
    else {
      & py -3 -m pip install --user git-filter-repo
    }

    if ($LASTEXITCODE -ne 0) {
      Write-Host "pip install failed. You can try running the command manually or use the alternatives in the README." -ForegroundColor Red
      exit 1
    }

    # After install, attempt to add the user Scripts dir to PATH for this session
    try {
      $scriptDir = & $pythonCmd -c "import site, os, sys; print(os.path.join(site.USER_BASE, 'Scripts'))"
    }
    catch {
      $scriptDir = $null
    }
    if ($scriptDir -and (Test-Path $scriptDir)) {
      Write-Host "Adding user Scripts dir to PATH for this session: $scriptDir" -ForegroundColor Cyan
      $env:Path = "$scriptDir;$env:Path"
    }

    # Re-check availability
    if (-not (Test-GitFilterRepoAvailable)) {
      Write-Host "git-filter-repo still not available after install. Possible PATH issue." -ForegroundColor Red
      Write-Host "Try opening a new shell or ensure $scriptDir is in your PATH." -ForegroundColor Yellow
      Write-Host "Alternative: download the single-file git_filter_repo.py and run it with Python, or use BFG (see README)." -ForegroundColor Cyan
      exit 1
    }

    Write-Host "git-filter-repo is now available." -ForegroundColor Green
  }
  else {
    Write-Host "Aborting. Please install git-filter-repo before running this script. Example:" -ForegroundColor Yellow
    Write-Host "  python -m pip install --user git-filter-repo" -ForegroundColor Cyan
    Write-Host "Or see scripts/PURGE-HISTORY-README.md for alternatives (BFG, direct script)." -ForegroundColor Cyan
    exit 1
  }
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
# git-filter-repo expects --path (singular) or --paths-from-file; use --path here
git filter-repo --invert-paths --path $PathsToRemove
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
