# Resume Builder 9000 Setup Script
param(
  [switch]$Help,
  # When set, install Playwright browsers and run the E2E suite at the end of setup.
  # By default E2E is skipped so CI/dev can run setup faster. Use -RunE2E to enable.
  [switch]$RunE2E
)

if ($Help) {
  Write-Host "Resume Builder 9000 Setup Script"
  Write-Host "Usage: ./setup.ps1 [-Help]"
  Write-Host ""
  Write-Host "This script installs all dependencies and builds the project."
  exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "Setting up Resume Builder 9000..."

# Check if Node.js is installed
try {
  $nodeVersion = node -v
  Write-Host "Node.js $nodeVersion detected"
}
catch {
  Write-Host "Node.js is not installed. Please install Node.js v18 or higher."
  exit 1
}

# Copy environment file
# If a `.env` already exists, leave it alone. Otherwise copy from `.env.example`.
if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Write-Host "Creating .env file from example..."
    Copy-Item -Path ".env.example" -Destination ".env" -Force
  }
  else {
    Write-Host "No .env or .env.example found - please create an .env file manually." -ForegroundColor Yellow
  }
}
else {
  Write-Host ".env already exists - leaving it unchanged."
}

# Install dependencies in root and important workspaces
Write-Host "Installing dependencies in root and workspace packages..."
try {
  Write-Host "Installing root dependencies..."
  npm install

  $workspaceDirs = @("apps/web", "packages/api", "packages/core")
  foreach ($dir in $workspaceDirs) {
    if (Test-Path $dir) {
      Write-Host "Installing dependencies in $dir..."
      Push-Location $dir
      npm install
      Pop-Location
    }
    else {
      Write-Host "Directory $dir not found - skipping npm install for it." -ForegroundColor Yellow
    }
  }
}
catch {
  Write-Host "npm install failed: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "Continuing setup, but you may need to run npm install manually." -ForegroundColor Yellow
}


# Build packages
Write-Host "Building packages..."
npm run build --workspaces

# Initialize database with centralized initializer and seed test user
Write-Host "Setting up database with centralized initializer (init-db.cjs) and seeder..."
try {
  # Ensure DB_PATH is set (fall back to repo default if not provided)
  if (-not $env:DB_PATH -or $env:DB_PATH -eq '') {
    $repoRoot = (Get-Location).Path
    $defaultDbPath = Join-Path $repoRoot 'packages\api\data\resume.db'
    $env:DB_PATH = $defaultDbPath
    Write-Host "DB_PATH not set; defaulting to $env:DB_PATH"
  }
  else {
    Write-Host "Using DB_PATH: $env:DB_PATH"
  }

  # Run the centralized DB initializer (idempotent)
  Write-Host "Running packages/api/init-db.cjs to apply schema..."
  node .\packages\api\init-db.cjs

  # Seed the deterministic test user using the existing seeder script
  Write-Host "Seeding test user via scripts/seed-users.js..."
  node .\scripts\seed-users.js

  Write-Host "[OK] Database initialized with test user (user@example.com / ValidPassword1!)" -ForegroundColor Green
}
catch {
  Write-Host "[WARN] Database setup failed: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "Continuing setup - you may need to run packages/api/init-db.cjs and scripts/seed-users.js manually"
}

# Run unit/integration tests
Write-Host "Running tests..."
npm run test --workspaces

# Optionally install Playwright browsers and run E2E tests
if ($RunE2E) {
  Write-Host "Installing Playwright browsers..."
  npx playwright install

  # Run Playwright E2E tests with dot reporter for autonomous exit
  Write-Host "Running Playwright E2E tests (dot reporter)..."
  npx playwright test apps/web/tests/e2e --reporter=dot
}
else {
  Write-Host "Skipping Playwright install/tests. To run E2E, re-run setup.ps1 with the -RunE2E switch."
}

Write-Host "Setup complete! You can now run task 'Run Dev Script (direct)' to start the development environment."
