# Resume Builder 9000 Setup Script
param(
  [switch]$Help
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
    Write-Host "No .env or .env.example found — please create an .env file manually." -ForegroundColor Yellow
  }
}
else {
  Write-Host ".env already exists — leaving it unchanged."
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
      Write-Host "Directory $dir not found — skipping npm install for it." -ForegroundColor Yellow
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

# Initialize database with test user for integration tests
Write-Host "Setting up database with test user..."
try {
  $dbSetupScript = @"
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Path to the API package resume.db file
const dbPath = path.join(__dirname, 'packages', 'api', 'data', 'resume.db');

console.log('Initializing database for integration tests...');
const db = new Database(dbPath);

// Create users table with proper schema
console.log('Creating users table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Clear existing test users and create fresh test user
console.log('Creating test user: user@example.com');
db.exec('DELETE FROM users WHERE email = ''user@example.com''');

const hashedPassword = bcrypt.hashSync('ValidPassword1!', 10);
const { randomUUID } = require('crypto');
const testUserId = randomUUID();

// Insert including generated UUID for id column
db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(testUserId, 'user@example.com', hashedPassword);

const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get('user@example.com');
console.log('Test user created successfully:', user);

db.close();
console.log('Database setup complete!');
"@

  $dbSetupScript | Out-File -FilePath "temp-db-setup.js" -Encoding utf8
  node temp-db-setup.js
  Remove-Item "temp-db-setup.js"

  Write-Host "✅ Database initialized with test user (user@example.com / ValidPassword1!)" -ForegroundColor Green
}
catch {
  Write-Host "⚠️  Database setup failed: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "Continuing setup - you may need to run scripts/seed-users.js manually"
}

# Run unit/integration tests
Write-Host "Running tests..."
npm run test --workspaces

# Install Playwright browsers (for E2E tests)
Write-Host "Installing Playwright browsers..."
npx playwright install

# Run Playwright E2E tests with dot reporter for autonomous exit
Write-Host "Running Playwright E2E tests (dot reporter)..."
npx playwright test apps/web/tests/e2e --reporter=dot

Write-Host "Setup complete! You can now run task 'Run Dev Script (direct)' to start the development environment."
