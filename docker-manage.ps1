# Resume Builder 9000 - Docker Management Script (PowerShell)
# Provides easy commands for managing Docker containers on Windows

param(
  [string]$Command,
  [string]$Environment,
  [string]$Service
)

# Function to print colored output
function Write-Status {
  param([string]$Message)
  Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
  param([string]$Message)
  Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
  param([string]$Message)
  Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
  param([string]$Message)
  Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
  try {
    docker info | Out-Null
    return $true
  }
  catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
  }
}

# Function to build production images
function Build-Production {
  Write-Status "Building production images..."

  try {
    # Build API image
    Write-Status "Building API production image..."
    docker build -f Dockerfile.production --target api-runtime -t rb9k-api:latest .

    # Build Web image
    Write-Status "Building Web production image..."
    docker build -f Dockerfile.production --target web-runtime -t rb9k-web:latest .

    Write-Success "Production images built successfully!"
  }
  catch {
    Write-Error "Failed to build production images: $_"
    exit 1
  }
}

# Function to build development images
function Build-Development {
  Write-Status "Building development images..."

  try {
    # Build API dev image
    Write-Status "Building API development image..."
    docker build -f Dockerfile.development --target api-dev -t rb9k-api-dev:latest .

    # Build Web dev image
    Write-Status "Building Web development image..."
    docker build -f Dockerfile.development --target web-dev -t rb9k-web-dev:latest .

    Write-Success "Development images built successfully!"
  }
  catch {
    Write-Error "Failed to build development images: $_"
    exit 1
  }
}

# Function to start production environment
function Start-Production {
  Write-Status "Starting production environment..."

  try {
    # Create data directories
    if (!(Test-Path ".\data\api")) {
      New-Item -ItemType Directory -Path ".\data\api" -Force | Out-Null
    }
    if (!(Test-Path ".\data\uploads")) {
      New-Item -ItemType Directory -Path ".\data\uploads" -Force | Out-Null
    }

    docker-compose up -d

    Write-Success "Production environment started!"
    Write-Status "API: http://localhost:4000"
    Write-Status "Web: http://localhost:3000"
  }
  catch {
    Write-Error "Failed to start production environment: $_"
    exit 1
  }
}

# Function to start development environment
function Start-Development {
  Write-Status "Starting development environment..."

  try {
    docker-compose -f docker-compose.dev.yml up -d

    Write-Success "Development environment started!"
    Write-Status "API: http://localhost:4000 (Debug: 9229)"
    Write-Status "Web: http://localhost:3000"
  }
  catch {
    Write-Error "Failed to start development environment: $_"
    exit 1
  }
}

# Function to stop all containers
function Stop-Containers {
  Write-Status "Stopping all containers..."

  try {
    docker-compose down
    docker-compose -f docker-compose.dev.yml down

    Write-Success "All containers stopped!"
  }
  catch {
    Write-Error "Failed to stop containers: $_"
  }
}

# Function to clean up everything
function Remove-Everything {
  Write-Warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
  $response = Read-Host

  if ($response -match "^[Yy]$") {
    Write-Status "Cleaning up containers and images..."

    try {
      # Stop and remove containers
      docker-compose down -v
      docker-compose -f docker-compose.dev.yml down -v

      # Remove images
      docker rmi rb9k-api:latest, rb9k-web:latest, rb9k-api-dev:latest, rb9k-web-dev:latest 2>$null

      # Remove volumes
      docker volume prune -f

      Write-Success "Cleanup completed!"
    }
    catch {
      Write-Warning "Some cleanup operations may have failed: $_"
    }
  }
  else {
    Write-Status "Cleanup cancelled."
  }
}

# Function to show logs
function Show-Logs {
  param(
    [string]$Env = "production",
    [string]$ServiceName = ""
  )

  try {
    if ($Env -eq "dev") {
      if ($ServiceName) {
        docker-compose -f docker-compose.dev.yml logs -f $ServiceName
      }
      else {
        docker-compose -f docker-compose.dev.yml logs -f
      }
    }
    else {
      if ($ServiceName) {
        docker-compose logs -f $ServiceName
      }
      else {
        docker-compose logs -f
      }
    }
  }
  catch {
    Write-Error "Failed to show logs: $_"
  }
}

# Function to show help
function Show-Help {
  Write-Host "Resume Builder 9000 - Docker Management Script" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Usage: .\docker-manage.ps1 -Command <command> [options]" -ForegroundColor White
  Write-Host ""
  Write-Host "Commands:" -ForegroundColor Yellow
  Write-Host "  build-prod          Build production images"
  Write-Host "  build-dev           Build development images"
  Write-Host "  start-prod          Start production environment"
  Write-Host "  start-dev           Start development environment"
  Write-Host "  stop                Stop all containers"
  Write-Host "  restart-prod        Restart production environment"
  Write-Host "  restart-dev         Restart development environment"
  Write-Host "  logs                Show logs (-Environment prod|dev, -Service api|web)"
  Write-Host "  status              Show container status"
  Write-Host "  cleanup             Remove all containers, images, and volumes"
  Write-Host "  help                Show this help message"
  Write-Host ""
  Write-Host "Examples:" -ForegroundColor Yellow
  Write-Host "  .\docker-manage.ps1 -Command build-prod"
  Write-Host "  .\docker-manage.ps1 -Command start-dev"
  Write-Host "  .\docker-manage.ps1 -Command logs -Environment dev -Service api"
  Write-Host "  .\docker-manage.ps1 -Command status"
}

# Function to show status
function Show-Status {
  Write-Status "Container Status:"
  Write-Host ""

  try {
    docker ps -a --filter "name=rb9k" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    Write-Host ""
    Write-Status "Image Status:"
    docker images --filter "reference=rb9k*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
  }
  catch {
    Write-Error "Failed to show status: $_"
  }
}

# Main script logic
function Main {
  # Check if Docker is running
  Test-Docker

  switch ($Command.ToLower()) {
    "build-prod" {
      Build-Production
    }
    "build-dev" {
      Build-Development
    }
    "start-prod" {
      Start-Production
    }
    "start-dev" {
      Start-Development
    }
    "stop" {
      Stop-Containers
    }
    "restart-prod" {
      Stop-Containers
      Start-Production
    }
    "restart-dev" {
      Stop-Containers
      Start-Development
    }
    "logs" {
      Show-Logs -Env $Environment -ServiceName $Service
    }
    "status" {
      Show-Status
    }
    "cleanup" {
      Remove-Everything
    }
    "help" {
      Show-Help
    }
    default {
      if ($Command) {
        Write-Error "Unknown command: $Command"
        Write-Host ""
      }
      Show-Help
      if ($Command) { exit 1 }
    }
  }
}

# Run main function
Main
