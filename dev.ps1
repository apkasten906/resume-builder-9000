param(
  [switch]$Fresh,
  [switch]$WithLLM,
  [string]$LLMProvider = "",
  [string]$LLMModel = "",
  [switch]$ApiOnly,
  [switch]$WebOnly,
  [switch]$Help
)

# Function to verify if a service is running properly
function Test-ServiceHealth {
  param (
    [string]$Url,
    [int]$MaxAttempts = 15,
    [int]$DelaySeconds = 2,
    [string]$ServiceName,
    [switch]$RequireSuccess = $false
  )

  Write-Host "Checking $ServiceName health at $Url..."
  $attempts = 0
  $isHealthy = $false

  while ($attempts -lt $MaxAttempts -and -not $isHealthy) {
    try {
      $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
      if ($response -and $response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        Write-Host "$ServiceName is responsive with status code $($response.StatusCode)" -ForegroundColor Green
        $isHealthy = $true
      } else {
        throw "Non-successful status code: $($response.StatusCode)"
      }
    } catch {
      $attempts++
      if ($attempts -lt $MaxAttempts) {
        Write-Host "Waiting for $ServiceName to start (attempt $attempts of $MaxAttempts)..." -ForegroundColor Yellow
        Start-Sleep -Seconds $DelaySeconds
      }
    }
  }

  if (-not $isHealthy) {
    Write-Host "WARNING: $ServiceName is not responding after $MaxAttempts attempts" -ForegroundColor Red
    if ($RequireSuccess) {
      throw "$ServiceName health check failed"
    }
  }

  return $isHealthy
}

# Function to kill all dev server processes
function Stop-AllDevServers {
  param (
    [string]$Reason
  )

  Write-Host "Shutting down all development servers - $Reason" -ForegroundColor Yellow

  Get-Process | Where-Object { $_.ProcessName -match 'node' } | ForEach-Object {
    try {
      $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine
      if ($cmdLine -match 'npm run dev(:stable)?' -and ($cmdLine -match 'packages\\api' -or $cmdLine -match 'apps\\web')) {
        Write-Host "Stopping dev server process: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force
      }
    } catch {}
  }

  Write-Host "All development servers have been stopped." -ForegroundColor Yellow
}

if ($Help) {
  Write-Host "Resume Builder 9000 Development Script"
  Write-Host "Usage: ./dev.ps1 [-Fresh] [-WithLLM] [-LLMProvider <provider>] [-LLMModel <model>] [-ApiOnly] [-WebOnly] [-Help]"
  Write-Host ""
  Write-Host "Options:"
  Write-Host "  -Fresh          Remove all node_modules and do a fresh install"
  Write-Host "  -WithLLM        Enable external LLM integration (disabled by default)"
  Write-Host "  -LLMProvider    Specify the LLM provider (e.g., 'openai', 'anthropic')"
  Write-Host "  -LLMModel       Specify the LLM model to use"
  Write-Host "  -ApiOnly        Run only the API server"
  Write-Host "  -WebOnly        Run only the web frontend"
  Write-Host "  -Help           Show this help message"
  exit 0
}

try {
  # Clean if fresh flag is provided
  if ($Fresh) {
    Write-Host "🧹 Cleaning node_modules for fresh install..." -ForegroundColor Cyan
    if (Test-Path .\node_modules) { Remove-Item .\node_modules -Recurse -Force }
    if (Test-Path .\apps\web\node_modules) { Remove-Item .\apps\web\node_modules -Recurse -Force }
    if (Test-Path .\packages\api\node_modules) { Remove-Item .\packages\api\node_modules -Recurse -Force }
    if (Test-Path .\packages\core\node_modules) { Remove-Item .\packages\core\node_modules -Recurse -Force }
  }

  # Set environment variables
  $env:ALLOW_EXTERNAL_LLM = if ($WithLLM) { "true" } else { "false" }
  if ($LLMProvider) { $env:LLM_PROVIDER = $LLMProvider }
  if ($LLMModel) { $env:LLM_MODEL = $LLMModel }

  # Allow passing BASE_URL and NEXT_PUBLIC_API_URL for tests and dev server
  if ($null -eq $env:BASE_URL) { $env:BASE_URL = "http://localhost:3000" }
  if ($null -eq $env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL = "http://localhost:4000/api" }

  # Copy example environment file if it exists
  if (Test-Path ".env.example") { Copy-Item -Path ".env.example" -Destination ".env" -Force }

  # Display config
  Write-Host "Starting Resume Builder 9000 in development mode" -ForegroundColor Green
  Write-Host "External LLM: $($env:ALLOW_EXTERNAL_LLM)"
  if ($env:ALLOW_EXTERNAL_LLM -eq "true" -and $LLMProvider) {
    Write-Host "Provider: $($env:LLM_PROVIDER), Model: $($env:LLM_MODEL)"
  }

  # Install dependencies
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  $installOutput = npm i 2>&1

  # Check if installation succeeded
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to install dependencies. Exit code: $LASTEXITCODE"
  }

  # Check for critical vulnerabilities
  if ($installOutput -match "critical vulnerability" -or $installOutput -match "Critical severity") {
    Write-Host "WARNING: Critical security vulnerabilities detected in dependencies!" -ForegroundColor Red
    # Extract vulnerability details
    if ($installOutput -match "([0-9]+) critical") {
      $criticalCount = $Matches[1]
      Write-Host "Number of critical vulnerabilities: $criticalCount" -ForegroundColor Red
    }

    # Ask user if they want to continue despite vulnerabilities
    $continueAnyway = Read-Host "Critical vulnerabilities detected. Continue anyway? (y/n)"
    if ($continueAnyway -ne "y") {
      throw "Aborting due to critical vulnerabilities"
    }
  }

  # Check for Next.js SWC errors during installation
  if ($installOutput -match "Failed to load SWC binary") {
    Write-Host "WARNING: SWC binary loading issues detected. This may affect Next.js performance." -ForegroundColor Yellow
    Write-Host "You may need to configure Next.js to use Babel instead of SWC." -ForegroundColor Yellow

    # Configure Next.js to use Babel instead of SWC
    Write-Host "Configuring Next.js to use Babel instead of SWC..." -ForegroundColor Cyan

    if (Test-Path ".\apps\web\next.config.js") {
      $nextConfig = Get-Content -Path ".\apps\web\next.config.js" -Raw

      if (-not ($nextConfig -match "swcMinify: false")) {
        $nextConfig = $nextConfig -replace "const nextConfig = \{", "const nextConfig = {`n  swcMinify: false,`n  experimental: {`n    forceSwcTransforms: false,`n  },"
        Set-Content -Path ".\apps\web\next.config.js" -Value $nextConfig
      }
    }

    # Set environment variable to disable SWC
    $env:NEXT_DISABLE_SWC = "1"
    Write-Host "Next.js configured to use Babel instead of SWC." -ForegroundColor Green
  }

  # Build packages
  Write-Host "Building core packages..." -ForegroundColor Cyan
  npm run build --workspace=packages/core
  if ($LASTEXITCODE -ne 0) { throw "Failed to build core package" }

  npm run build --workspace=packages/api
  if ($LASTEXITCODE -ne 0) { throw "Failed to build API package" }

  Write-Host "Building web package..." -ForegroundColor Cyan
  npm run build --workspace=apps/web
  if ($LASTEXITCODE -ne 0) { throw "Failed to build web package" }


  # Run tests unless we're only running specific components
  if (-not $ApiOnly -and -not $WebOnly) {
    Write-Host "Running tests..." -ForegroundColor Cyan
    npm run test --if-present
    if ($LASTEXITCODE -ne 0) {
      Write-Host "[ERROR] Unit tests failed. Stopping script." -ForegroundColor Red
      $errorDetails = @"
Unit test failure at $(Get-Date)
Script: dev.ps1
Exit code: $LASTEXITCODE
See console output above for details.
"@
      Add-Content -Path "$PSScriptRoot\dev-error.log" -Value $errorDetails
      throw "Unit tests failed. See output above."
    }
  }

  # Kill any existing dev servers on ports 3000 and 4000 (API and Web)
  Write-Host "Ensuring no stale dev servers are running..." -ForegroundColor Cyan
  Get-Process | Where-Object { $_.ProcessName -match 'node' } | ForEach-Object {
    try {
      $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine
      if ($cmdLine -match 'npm run dev(:stable)?' -and ($cmdLine -match 'packages\\api' -or $cmdLine -match 'apps\\web')) {
        Write-Host "Killing stale dev server process: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force
      }
    } catch {}
  }

  # Track running processes so we can stop them if needed
  $apiProcess = $null
  $webProcess = $null

  # Start development servers
  if (-not $WebOnly) {
    Write-Host "Starting API server..." -ForegroundColor Cyan
    $apiProcess = Start-Process -NoNewWindow -PassThru powershell -ArgumentList "-Command cd $PSScriptRoot\packages\api; npm run dev"

    # Wait a bit before checking health
    Start-Sleep -Seconds 5

    $apiHealth = Test-ServiceHealth -Url "http://localhost:4000" -ServiceName "API server" -RequireSuccess:$true
    if (-not $apiHealth) {
      throw "API server failed to start"
    }

    Write-Host "API server started on http://localhost:4000" -ForegroundColor Green
  }

  if (-not $ApiOnly) {
    Write-Host "Starting Web frontend..." -ForegroundColor Cyan
    Write-Host "Using stable build mode to avoid Next.js file watcher issues..." -ForegroundColor Yellow
    $webProcess = Start-Process -NoNewWindow -PassThru powershell -ArgumentList "-Command cd $PSScriptRoot\apps\web; npm run dev:stable"

    # Wait a bit before checking health
    Start-Sleep -Seconds 5

    $webHealth = Test-ServiceHealth -Url "http://localhost:3000" -ServiceName "Web frontend"
    if (-not $webHealth -and -not $ApiOnly) {
      if (-not $ApiOnly) {
        Write-Host "Continuing with development despite Web frontend issues" -ForegroundColor Yellow
      }
    }

    Write-Host "Web frontend started on http://localhost:3000" -ForegroundColor Green
  }

  Write-Host "Development environment is running" -ForegroundColor Green
  Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan

  # Monitor processes to detect crashes
  while ($true) {
    $allRunning = $true

    if ($apiProcess -and -not $WebOnly) {
      if ($apiProcess.HasExited) {
        Write-Host "[ERROR] API server has stopped unexpectedly" -ForegroundColor Red
        $allRunning = $false
      }
    }

    if ($webProcess -and -not $ApiOnly) {
      if ($webProcess.HasExited) {
        Write-Host "[ERROR] Web frontend has stopped unexpectedly" -ForegroundColor Red
        $allRunning = $false
      }
    }

    if (-not $allRunning) {
      throw "Development services stopped unexpectedly"
    }

    Start-Sleep -Seconds 3
  }
}
catch {
  Write-Host "Error: $_" -ForegroundColor Red
  Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed

  # Log error to file
  $errorDetails = @"
Error occurred at $(Get-Date)
Message: $_
Stack trace:
$($_.ScriptStackTrace)
"@
  Add-Content -Path "$PSScriptRoot\dev-error.log" -Value $errorDetails

  # Stop all servers in case of error
  Stop-AllDevServers -Reason "Error occurred: $_"

  # Return non-zero exit code
  exit 1
}
finally {
  # Cleanup on exit
  Write-Host "Shutting down development environment..." -ForegroundColor Yellow
  Stop-AllDevServers -Reason "Script ended"
}
