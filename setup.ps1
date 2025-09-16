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
$rootDir = $PSScriptRoot

Write-Host "📦 Setting up Resume Builder 9000..."

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected"
}
catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
}

# Copy environment file
if (Test-Path ".env.example") {
    Write-Host "📄 Creating .env file from example..."
    Copy-Item -Path ".env.example" -Destination ".env" -Force
}

# Install dependencies
Write-Host "📦 Installing dependencies..."
npm install

# Build packages
Write-Host "🛠️ Building packages..."
npm run build --workspaces

# Run tests
Write-Host "🧪 Running tests..."
npm run test --workspaces

# Set up Git hooks
Write-Host "🪝 Setting up Git hooks..."
& "$PSScriptRoot\scripts\setup-hooks.ps1"

Write-Host "✅ Setup complete! You can now run './dev.ps1' to start the development environment."
