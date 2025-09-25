param(
  [switch]$Fresh,
  [switch]$WithLLM,
  [string]$LLMProvider = "",
  [string]$LLMModel = "",
  [switch]$ApiOnly,
  [switch]$WebOnly,
  [switch]$Help
)

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

# Clean if fresh flag is provided
if ($Fresh) {
  Write-Host "🧹 Cleaning node_modules for fresh install..."
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
if ($env:BASE_URL -eq $null) { $env:BASE_URL = "http://localhost:3000" }
if ($env:NEXT_PUBLIC_API_URL -eq $null) { $env:NEXT_PUBLIC_API_URL = "http://localhost:4000/api" }

# Copy example environment file if it exists
if (Test-Path ".env.example") { Copy-Item -Path ".env.example" -Destination ".env" -Force }

# Display config
Write-Host "Starting Resume Builder 9000 in development mode"
Write-Host "External LLM: $($env:ALLOW_EXTERNAL_LLM)"
if ($env:ALLOW_EXTERNAL_LLM -eq "true" -and $LLMProvider) {
  Write-Host "Provider: $($env:LLM_PROVIDER), Model: $($env:LLM_MODEL)"
}

# Install dependencies and build packages
npm i
npm run build

# Run tests unless we're only running specific components
if (-not $ApiOnly -and -not $WebOnly) {
  Write-Host "Running tests..."
  try {
    npm run test --if-present
  } catch {
    Write-Host "[ERROR] Some tests may have failed. See output above."
    # Optionally log to a file
    Add-Content -Path "$PSScriptRoot\dev-error.log" -Value "Test run failed at $(Get-Date)"
  }
}


# Kill any existing dev servers on ports 3000 and 4000 (API and Web)
Write-Host "Ensuring no stale dev servers are running..."
Get-Process | Where-Object { $_.ProcessName -match 'node' } | ForEach-Object {
  try {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine
    if ($cmdLine -match 'npm run dev' -and ($cmdLine -match 'packages\\api' -or $cmdLine -match 'apps\\web')) {
      Write-Host "Killing stale dev server process: $($_.Id) $cmdLine"
      Stop-Process -Id $_.Id -Force
    }
  } catch {}
}

# Start development servers
if (-not $WebOnly) {
  Start-Process -NoNewWindow powershell -ArgumentList "-Command cd $PSScriptRoot\packages\api; npm run dev"
  Write-Host "API server started on http://localhost:4000"
}

if (-not $ApiOnly) {
  Start-Process -NoNewWindow powershell -ArgumentList "-Command cd $PSScriptRoot\apps\web; npm run dev"
  Write-Host "Web frontend started on http://localhost:3000"
}

Write-Host "Development environment is running"
Write-Host "Press Ctrl+C to stop"

# Keep script running
try {
  while ($true) { Start-Sleep -Seconds 1 }
}
finally {
  # Cleanup on exit
  Write-Host "Shutting down development environment..."
}
