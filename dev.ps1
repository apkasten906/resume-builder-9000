param(
  [switch]$Fresh,
  [switch]$WithLLM,
  [string]$LLMProvider = "",
  [string]$LLMModel = "",
  [switch]$ApiOnly,
  [switch]$WebOnly,
  [switch]$PersistTestSecret,
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
      }
      else {
        throw "Non-successful status code: $($response.StatusCode)"
      }
    }
    catch {
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

function GetLocalEnvVariable {
  param (
    [string]$RequiredVar = "", # Name of the environment variable to retrieve
    [string]$EnvFilePath = "./.env", # Path to the .env file
    [switch]$Debug = $false # If set, enables debug output for this function
  )

  $value = $null

  if (-not (Test-Path $EnvFilePath)) {
    Write-Warning "$EnvFilePath not found."
    return $value
  }

  if ((Test-Path $EnvFilePath) -and (-not $value)) {
    Get-Content $EnvFilePath | ForEach-Object {
      if ($_ -match "^($RequiredVar)=(.*)$") {
        $value = $matches[2].Trim()
        if ($Debug) { Write-Host "[DEBUG] Loaded $RequiredVar from .env: $value" -ForegroundColor Green }
      }
    }
  }

  # Normalize empty values to $null and strip surrounding quotes (use char array to avoid quoting/escape pitfalls)
  if ($value -and ($value.StartsWith("'") -or $value.StartsWith('"'))) {
    $trimChars = @("'", '"', '`')
    $value = $value.Trim($trimChars)
  }

  return $value
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
    }
    catch {}
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

  # Set environment variables for LLM integration
  $env:ALLOW_EXTERNAL_LLM = if ($WithLLM) { $true } else { GetLocalEnvVariable -RequiredVar "ALLOW_EXTERNAL_LLM" }
  $env:LLM_PROVIDER = if ($LLMProvider) { $LLMProvider } else { GetLocalEnvVariable -RequiredVar "LLM_PROVIDER" }
  $env:LLM_MODEL = if ($LLMModel) { $LLMModel } else { GetLocalEnvVariable -RequiredVar "LLM_MODEL" }

  if ($env:ALLOW_EXTERNAL_LLM -eq $true) {
    if (-not $env:LLM_PROVIDER) {
      throw "LLM integration enabled but LLM_PROVIDER is not set. Use -LLMProvider or set it in .env"
    }
    if (-not $env:LLM_MODEL) {
      throw "LLM integration enabled but LLM_MODEL is not set. Use -LLMModel or set it in .env"
    }
    Write-Host "External LLM integration enabled with provider '$($env:LLM_PROVIDER)' and model '$($env:LLM_MODEL)'" -ForegroundColor Green
  }
  else {
    Write-Host "External LLM integration is disabled" -ForegroundColor Yellow
  }

  # Set web frontend and API server environment variables
  $env:WEB_BASE = if (-not $env:WEB_BASE) { GetLocalEnvVariable -RequiredVar "WEB_BASE" } else { "http://localhost:3000" }
  $env:API_BASE = if (-not $env:API_BASE) { GetLocalEnvVariable -RequiredVar "API_BASE" } else { "http://localhost:4000" }

  Write-Host "Detected Web frontend URL: $($env:WEB_BASE)"
  Write-Host "Detected API server URL: $($env:API_BASE)"

  # Copy example environment file if .env does not exist
  if (-not (Test-Path ".env")) { Copy-Item -Path ".env.example" -Destination ".env" -Force }


  # If test routes are enabled but no TEST_ROUTE_SECRET is provided, generate a
  # secure secret for the current session and persist it to .env (development only).
  # This makes local runs easier while keeping the secret out of source control.
  if ([string]::IsNullOrEmpty($env:ENABLE_TEST_ROUTES)) {
    $env:ENABLE_TEST_ROUTES = GetLocalEnvVariable -RequiredVar "ENABLE_TEST_ROUTES"
  }
  if ([string]::IsNullOrEmpty($env:ENABLE_TEST_ROUTES)) { $env:ENABLE_TEST_ROUTES = 'false' }

  if ([string]::IsNullOrEmpty($env:TEST_ROUTE_SECRET)) {
    $env:TEST_ROUTE_SECRET = GetLocalEnvVariable -RequiredVar "TEST_ROUTE_SECRET"
  }

  if ($env:ENABLE_TEST_ROUTES -eq 'true' -and [string]::IsNullOrEmpty($env:TEST_ROUTE_SECRET)) {
    # Generate 32 bytes of cryptographically secure random data and base64-encode it.
    $bytes = New-Object 'System.Byte[]' 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $generatedSecret = [Convert]::ToBase64String($bytes)
    Write-Host "Generating secure TEST_ROUTE_SECRET for this development session." -ForegroundColor Green
    $envFile = ".env"
    try {
      if ($PersistTestSecret) {
        if (Test-Path $envFile) {
          $content = Get-Content -Raw -Path $envFile
          if ($content -match '(?im)^TEST_ROUTE_SECRET\s*=') {
            $newContent = $content -replace '(?im)^TEST_ROUTE_SECRET\s*=.*$', "TEST_ROUTE_SECRET=$generatedSecret"
            Set-Content -Path $envFile -Value $newContent
          }
          else {
            Add-Content -Path $envFile -Value "`nTEST_ROUTE_SECRET=$generatedSecret"
          }
        }
        else {
          Set-Content -Path $envFile -Value "TEST_ROUTE_SECRET=$generatedSecret"
        }
        Write-Host ".env updated with TEST_ROUTE_SECRET (do not commit .env)" -ForegroundColor Yellow
      }
      else {
        Write-Host "TEST_ROUTE_SECRET generated for session only (use -PersistTestSecret to persist to .env)" -ForegroundColor Yellow
      }
      $env:TEST_ROUTE_SECRET = $generatedSecret
    }
    catch {
      Write-Host "Failed to persist TEST_ROUTE_SECRET to .env: $_" -ForegroundColor Yellow
      $env:TEST_ROUTE_SECRET = $generatedSecret
    }
  }


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
        # Use a regex that tolerates spaces between tokens when matching the object start
        $nextConfig = $nextConfig -replace 'const\s+nextConfig\s*=\s*\{', "const nextConfig = { `n  swcMinify: false, `n  experimental: { `n    forceSwcTransforms: false, `n  },"
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
    }
    catch {}
  }

  # --- Robust port/process cleanup before starting servers ---

  function Stop-PortProcess {
    param([int]$Port)
    $netstat = netstat -ano | Select-String ":$Port "
    foreach ($line in $netstat) {
      if ($line -match '\s+(\d+)$') {
        $procId = $matches[1]
        try {
          Write-Host "Killing process on port $Port (PID: $procId)" -ForegroundColor Yellow
          Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
        catch {
          Write-Host ("Failed to kill process {0} on port {1}: {2}" -f $procId, $Port, $_) -ForegroundColor Red
        }
      }
    }
  }

  $apiPort = $env:API_BASE.Split(':')[-1]
  $webPort = $env:WEB_BASE.Split(':')[-1]
  $env:WEB_PORT = $webPort
  $env:API_PORT = $apiPort

  Write-Host "Ensuring no stale dev servers are running on ports $apiPort and $webPort..." -ForegroundColor Cyan
  Stop-PortProcess -Port $apiPort
  Stop-PortProcess -Port $webPort
  # --- End port/process cleanup ---

  # Track running processes so we can stop them if needed
  $apiProcess = $null
  $webProcess = $null

  # Start development servers
  if (-not $WebOnly) {
    Write-Host "Starting API server on port $env:API_PORT..." -ForegroundColor Cyan
    # Start npm in the packages/api working directory using cmd.exe so the npm.cmd shim is invoked correctly on Windows
    $apiProcess = Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "$PSScriptRoot\packages\api"

    # Wait a bit before checking health
    Start-Sleep -Seconds 5

    # Use a guaranteed 200 endpoint for health check
    $apiHealthUrl = $env:API_BASE
    if ($apiHealthUrl -notlike "*/api/health*") {
      if ($apiHealthUrl.TrimEnd('/') -match '^https?://[^/]+(:\d+)?$') {
        $apiHealthUrl = "$apiHealthUrl/api/health"
      }
      else {
        $apiHealthUrl = "$apiHealthUrl/health"
      }
    }
    $apiHealth = Test-ServiceHealth -Url $apiHealthUrl -ServiceName "API server" -RequireSuccess:$true
    if (-not $apiHealth) {
      throw "API server failed to start"
    }

    Write-Host "API server started on $env:API_BASE" -ForegroundColor Green
  }

  if (-not $ApiOnly) {
    Write-Host "Starting Web frontend on port $env:WEB_PORT..." -ForegroundColor Cyan
    Write-Host "Using stable build mode to avoid Next.js file watcher issues..." -ForegroundColor Yellow
    # Start npm run dev:stable in the web working directory using cmd.exe so the npm shim is invoked correctly
    # $webProcess = Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList "/c next build && next start -p $env:WEB_PORT" -WorkingDirectory "$PSScriptRoot\apps\web"
    $webProcess = Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList "/c npm run dev:stable" -WorkingDirectory "$PSScriptRoot\apps\web"

    # Wait a bit before checking health
    Start-Sleep -Seconds 5

    $webHealth = Test-ServiceHealth -Url $env:WEB_BASE -ServiceName "Web frontend"
    if (-not $webHealth -and -not $ApiOnly) {
      if (-not $ApiOnly) {
        Write-Host "Continuing with development despite Web frontend issues" -ForegroundColor Yellow
      }
    }

    Write-Host "Web frontend started on $env:WEB_BASE" -ForegroundColor Green
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
